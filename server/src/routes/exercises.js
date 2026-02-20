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

const findTrainingDate = async (userId, fileId, date) => {
  const dt = toDateStartUtc(date);
  if (!dt) return null;

  return TrainingDate.findOne({
    userId,
    trainingFileId: fileId,
    date: dt,
  });
};

const mapEntriesToExercises = async (entries) => {
  const libraryIds = entries.map((e) => e.exerciseUserLibraryId.toString());
  const uniqueIds = [...new Set(libraryIds)];
  const libs = uniqueIds.length
    ? await ExerciseUserLibrary.find({ _id: { $in: uniqueIds } }).select('name')
    : [];

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

const ensureFile = async (userId, fileId) => {
  if (!mongoose.isValidObjectId(fileId)) return null;
  return TrainingFile.findOne({ _id: fileId, userId });
};

router.get('/', async (req, res) => {
  try {
    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const dateEntry = await findTrainingDate(req.userId, req.params.fileId, req.params.date);
    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    const entries = await ExerciseEntry.find({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
    });

    const exercises = await mapEntriesToExercises(entries);
    res.json({ exercises });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, exerciseUserLibraryId } = req.body;
    if ((!name || !name.trim()) && !exerciseUserLibraryId) {
      return res.status(400).json({ message: 'Имя упражнения обязательно' });
    }

    const file = await ensureFile(req.userId, req.params.fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const dateEntry = await findTrainingDate(req.userId, req.params.fileId, req.params.date);
    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    let libraryExercise = null;

    if (exerciseUserLibraryId && mongoose.isValidObjectId(exerciseUserLibraryId)) {
      libraryExercise = await ExerciseUserLibrary.findOne({
        _id: exerciseUserLibraryId,
        userId: req.userId,
      });
      if (!libraryExercise) {
        return res.status(404).json({ message: 'Упражнение из библиотеки не найдено' });
      }
    } else {
      const normalizedName = name.trim();
      const escaped = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

      libraryExercise = await ExerciseUserLibrary.findOne({
        userId: req.userId,
        name: { $regex: `^${escaped}$`, $options: 'i' },
      });

      if (!libraryExercise) {
        libraryExercise = await ExerciseUserLibrary.create({ userId: req.userId, name: normalizedName });
      }
    }

    const existing = await ExerciseEntry.findOne({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
      exerciseUserLibraryId: libraryExercise._id,
    });

    if (existing) {
      const [mapped] = await mapEntriesToExercises([existing]);
      return res.status(200).json(mapped);
    }

    const entry = await ExerciseEntry.create({
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
      exerciseUserLibraryId: libraryExercise._id,
      weights: [],
    });

    const [mapped] = await mapEntriesToExercises([entry]);
    res.status(201).json(mapped);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(400).json({ message: 'Это упражнение уже добавлено на выбранную дату' });
    }
    res.status(500).json({ message: 'Ошибка добавления упражнения' });
  }
});

router.post('/apply-template', async (req, res) => {
  try {
    const { exercises: templateExercises } = req.body;
    const { fileId, date } = req.params;

    if (!Array.isArray(templateExercises)) {
      return res.status(400).json({ message: 'Неверный формат упражнений в шаблоне' });
    }

    const file = await ensureFile(req.userId, fileId);
    if (!file) return res.status(404).json({ message: 'Файл не найден' });

    const dateEntry = await findTrainingDate(req.userId, fileId, date);
    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    const createdOrFound = [];

    for (const exercise of templateExercises) {
      if (!exercise) continue;

      let libraryExercise = null;

      if (exercise.exerciseUserLibraryId && mongoose.isValidObjectId(exercise.exerciseUserLibraryId)) {
        libraryExercise = await ExerciseUserLibrary.findOne({
          _id: exercise.exerciseUserLibraryId,
          userId: req.userId,
        });
      } else if (exercise.name && typeof exercise.name === 'string') {
        const normalizedName = exercise.name.trim();
        if (!normalizedName) continue;

        libraryExercise = await ExerciseUserLibrary.findOne({ userId: req.userId, name: normalizedName });
        if (!libraryExercise) {
          libraryExercise = await ExerciseUserLibrary.create({ userId: req.userId, name: normalizedName });
        }
      }

      if (!libraryExercise) continue;

      let entry = await ExerciseEntry.findOne({
        userId: req.userId,
        trainingFileId: fileId,
        trainingDateId: dateEntry._id,
        exerciseUserLibraryId: libraryExercise._id,
      });

      if (!entry) {
        entry = await ExerciseEntry.create({
          userId: req.userId,
          trainingFileId: fileId,
          trainingDateId: dateEntry._id,
          exerciseUserLibraryId: libraryExercise._id,
          weights: [],
        });
      }

      createdOrFound.push(entry);
    }

    const mapped = await mapEntriesToExercises(createdOrFound);
    res.status(201).json(mapped);
  } catch (err) {
    res.status(500).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

router.put('/:exerciseId', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name || !name.trim()) return res.status(400).json({ message: 'Имя упражнения обязательно' });

    const dateEntry = await findTrainingDate(req.userId, req.params.fileId, req.params.date);
    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    const entry = await ExerciseEntry.findOne({
      _id: req.params.exerciseId,
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
    });

    if (!entry) return res.status(404).json({ message: 'Упражнение не найдено' });

    const normalizedName = name.trim();
    const escaped = normalizedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    let targetLibrary = await ExerciseUserLibrary.findOne({
      userId: req.userId,
      name: { $regex: `^${escaped}$`, $options: 'i' },
    });

    if (!targetLibrary) {
      targetLibrary = await ExerciseUserLibrary.create({
        userId: req.userId,
        name: normalizedName,
      });
    }

    const duplicateEntry = await ExerciseEntry.findOne({
      _id: { $ne: entry._id },
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
      exerciseUserLibraryId: targetLibrary._id,
    });

    if (duplicateEntry) {
      return res.status(409).json({
        message: 'Упражнение с таким названием уже есть в этой дате',
      });
    }

    entry.exerciseUserLibraryId = targetLibrary._id;
    await entry.save();

    const [mapped] = await mapEntriesToExercises([entry]);
    res.json(mapped);
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(409).json({
        message: 'Упражнение с таким названием уже есть в этой дате',
      });
    }
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:exerciseId', async (req, res) => {
  try {
    const dateEntry = await findTrainingDate(req.userId, req.params.fileId, req.params.date);
    if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

    const deleted = await ExerciseEntry.findOneAndDelete({
      _id: req.params.exerciseId,
      userId: req.userId,
      trainingFileId: req.params.fileId,
      trainingDateId: dateEntry._id,
    });

    if (!deleted) return res.status(404).json({ message: 'Упражнение не найдено' });

    res.status(200).json({ message: 'Упражнение успешно удалено' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка на сервере при удалении упражнения' });
  }
});

router.get('/test-apply-template', (req, res) => {
  res.json({
    message: 'Apply template endpoint is accessible',
    params: req.params,
    timestamp: new Date().toISOString(),
  });
});

export default router;
