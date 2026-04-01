import express from 'express';
import mongoose from 'mongoose';
import TrainingFile from '../models/TrainingFile.js';
import TrainingDate from '../models/TrainingDate.js';
import ExerciseEntry from '../models/ExerciseEntry.js';
import ExerciseUserLibrary from '../models/ExerciseUserLibrary.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

const normalizeDateString = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString().split('T')[0];
  const str = String(value);
  return str.includes('T') ? str.split('T')[0] : str;
};

const toDateStartUtc = (dateLike) => {
  const normalized = normalizeDateString(dateLike);
  const dt = new Date(`${normalized}T00:00:00.000Z`);
  return Number.isNaN(dt.getTime()) ? null : dt;
};

const ensureFile = async (userId, fileId) => {
  if (!mongoose.isValidObjectId(fileId)) return null;
  return TrainingFile.findOne({ _id: fileId, userId });
};

const loadExerciseCountsByDateId = async (userId, fileId, trainingDateIds) => {
  if (!Array.isArray(trainingDateIds) || trainingDateIds.length === 0) {
    return new Map();
  }

  const counts = await ExerciseEntry.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
        trainingFileId: new mongoose.Types.ObjectId(fileId),
        trainingDateId: { $in: trainingDateIds.map((id) => new mongoose.Types.ObjectId(id)) },
      },
    },
    {
      $group: {
        _id: '$trainingDateId',
        count: { $sum: 1 },
      },
    },
  ]);

  return new Map(counts.map((item) => [String(item._id), item.count]));
};

const mapEntriesToExercises = async (entries) => {
  const libraryIds = entries.map((e) => e.exerciseUserLibraryId);
  const libs = await ExerciseUserLibrary.find({ _id: { $in: libraryIds } }).select('name');
  const nameById = new Map(libs.map((l) => [l._id.toString(), l.name]));

  return entries.map((entry) => ({
    _id: entry._id,
    exerciseUserLibraryId: entry.exerciseUserLibraryId,
    name: nameById.get(entry.exerciseUserLibraryId.toString()) || 'Unknown exercise',
    weights: entry.weights || [],
    createdAt: entry.createdAt,
    updatedAt: entry.updatedAt,
  }));
};

router.get('/', async (req, res) => {
  try {
    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const dates = await TrainingDate.find({
      userId: req.userId,
      trainingFileId: req.params.fileId,
    }).sort({ date: 1, createdAt: 1 });
    const exerciseCountsByDateId = await loadExerciseCountsByDateId(
      req.userId,
      req.params.fileId,
      dates.map((dateItem) => dateItem._id)
    );

    res.json(
      dates.map((d) => ({
        _id: d._id,
        userId: d.userId,
        trainingFileId: d.trainingFileId,
        date: normalizeDateString(d.date),
        exerciseCount: exerciseCountsByDateId.get(String(d._id)) || 0,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      }))
    );
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:date', async (req, res) => {
  try {
    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const dt = toDateStartUtc(req.params.date);
    if (!dt) return res.status(400).json({ message: 'Некорректная дата' });

    const dateEntry = await TrainingDate.findOne({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      date: dt,
    });

    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    const entries = await ExerciseEntry.find({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
    });

    const exercises = await mapEntriesToExercises(entries);

    res.json({
      _id: dateEntry._id,
      date: normalizeDateString(dateEntry.date),
      exercises,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const { date } = req.body;
    const dt = toDateStartUtc(date);
    if (!dt) return res.status(400).json({ message: 'Некорректная дата' });

    const exists = await TrainingDate.exists({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      date: dt,
    });

    if (exists) return res.status(400).json({ message: 'Дата уже существует' });

    await TrainingDate.create({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      date: dt,
    });

    const dates = await TrainingDate.find({
      userId: req.userId,
      trainingFileId: req.params.fileId,
    }).sort({ date: 1, createdAt: 1 });
    const exerciseCountsByDateId = await loadExerciseCountsByDateId(
      req.userId,
      req.params.fileId,
      dates.map((dateItem) => dateItem._id)
    );

    res.status(201).json({
      dates: dates.map((d) => ({
        _id: d._id,
        userId: d.userId,
        trainingFileId: d.trainingFileId,
        date: normalizeDateString(d.date),
        exerciseCount: exerciseCountsByDateId.get(String(d._id)) || 0,
        createdAt: d.createdAt,
        updatedAt: d.updatedAt,
      })),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:dateId', async (req, res) => {
  try {
    const { date } = req.body;
    const { fileId, dateId } = req.params;

    if (!date) return res.status(400).json({ message: 'Новая дата обязательна' });

    const file = await ensureFile(req.userId, fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const dt = toDateStartUtc(date);
    if (!dt) return res.status(400).json({ message: 'Некорректная дата' });

    const dateEntry = await TrainingDate.findOne({ _id: dateId, userId: req.userId, trainingFileId: fileId });
    if (!dateEntry) return res.status(404).json({ message: 'Запись даты не найдена' });

    const duplicate = await TrainingDate.exists({
      _id: { $ne: dateId },
      userId: req.userId,
      trainingFileId: fileId,
      date: dt,
    });

    if (duplicate) return res.status(400).json({ message: 'Эта дата уже существует' });

    dateEntry.date = dt;
    await dateEntry.save();

    res.json({
      success: true,
      message: 'Дата обновлена',
      date: {
        _id: dateEntry._id,
        userId: dateEntry.userId,
        trainingFileId: dateEntry.trainingFileId,
        date: normalizeDateString(dateEntry.date),
        exerciseCount: 0,
        createdAt: dateEntry.createdAt,
        updatedAt: dateEntry.updatedAt,
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:dateId', async (req, res) => {
  try {
    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const deleted = await TrainingDate.findOneAndDelete({
      _id: req.params.dateId,
      userId: req.userId,
      trainingFileId: req.params.fileId,
    });

    if (!deleted) return res.status(404).json({ message: 'Дата не найдена' });

    await ExerciseEntry.deleteMany({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: req.params.dateId,
    });

    res.json({ success: true, message: 'Дата удалена' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;
