import express from 'express';
import mongoose from 'mongoose';
import TrainingDate from '../models/TrainingDate.js';
import ExerciseEntry from '../models/ExerciseEntry.js';
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

const getExerciseEntryForRoute = async ({ userId, fileId, dateParam, exerciseId }) => {
  const dt = toDateStartUtc(dateParam);
  if (!dt) return { error: 'Дата не найдена', status: 404 };

  const trainingDate = await TrainingDate.findOne({
    userId,
    trainingFileId: fileId,
    date: dt,
  });

  if (!trainingDate) return { error: 'Дата не найдена', status: 404 };

  const exercise = await ExerciseEntry.findOne({
    _id: exerciseId,
    userId,
    trainingFileId: fileId,
    trainingDateId: trainingDate._id,
  });

  if (!exercise) return { error: 'Упражнение не найдено', status: 404 };

  return { trainingDate, exercise };
};

router.get('/', async (req, res) => {
  try {
    const { fileId, date, exerciseId } = req.params;
    const data = await getExerciseEntryForRoute({ userId: req.userId, fileId, dateParam: date, exerciseId });

    if (data.error) return res.status(data.status).json({ message: data.error });

    res.json(data.exercise.weights || []);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { weight } = req.body;
    const parsedWeight = Number(weight);

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      return res.status(400).json({ message: 'Введите корректный вес (положительное число)' });
    }

    const { fileId, date, exerciseId } = req.params;
    const data = await getExerciseEntryForRoute({ userId: req.userId, fileId, dateParam: date, exerciseId });

    if (data.error) return res.status(data.status).json({ message: data.error });

    data.exercise.weights.push({
      _id: new mongoose.Types.ObjectId(),
      weight: parsedWeight,
      sets: [],
    });

    await data.exercise.save();

    const createdWeight = data.exercise.weights[data.exercise.weights.length - 1];
    res.status(201).json(createdWeight);
  } catch (err) {
    res.status(500).json({
      message: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  }
});

router.put('/:weightId', async (req, res) => {
  try {
    const parsedWeight = Number(req.body.weight);

    if (!Number.isFinite(parsedWeight) || parsedWeight <= 0) {
      return res.status(400).json({ message: 'Введите корректный вес (положительное число)' });
    }

    const { fileId, date, exerciseId, weightId } = req.params;
    const data = await getExerciseEntryForRoute({ userId: req.userId, fileId, dateParam: date, exerciseId });

    if (data.error) return res.status(data.status).json({ message: data.error });

    const weightObj = data.exercise.weights.id(weightId);
    if (!weightObj) return res.status(404).json({ message: 'Вес не найден' });

    weightObj.weight = parsedWeight;
    await data.exercise.save();

    res.json(weightObj);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete('/:weightId', async (req, res) => {
  try {
    const { fileId, date, exerciseId, weightId } = req.params;
    const data = await getExerciseEntryForRoute({ userId: req.userId, fileId, dateParam: date, exerciseId });

    if (data.error) return res.status(data.status).json({ message: data.error });

    const weightObj = data.exercise.weights.id(weightId);
    if (!weightObj) return res.status(404).json({ message: 'Вес не найден' });

    data.exercise.weights.pull(weightId);
    await data.exercise.save();

    res.status(200).json({ message: 'Вес успешно удален' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/test', (req, res) => {
  res.json({
    message: 'Weights router is working',
    params: req.params,
    timestamp: new Date().toISOString(),
  });
});

export default router;
