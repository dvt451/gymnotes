import express from 'express';
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

const getWeightForRoute = async ({ userId, fileId, dateParam, exerciseId, weightId }) => {
  const dt = toDateStartUtc(dateParam);
  if (!dt) return { error: 'Date not found', status: 404 };

  const trainingDate = await TrainingDate.findOne({
    userId,
    trainingFileId: fileId,
    date: dt,
  });

  if (!trainingDate) return { error: 'Date not found', status: 404 };

  const exercise = await ExerciseEntry.findOne({
    _id: exerciseId,
    userId,
    trainingFileId: fileId,
    trainingDateId: trainingDate._id,
  });

  if (!exercise) return { error: 'Exercise not found', status: 404 };

  const weight = exercise.weights.id(weightId);
  if (!weight) return { error: 'Weight not found', status: 404 };

  return { exercise, weight };
};

router.get('/', async (req, res) => {
  try {
    const { fileId, date, exerciseId, weightId } = req.params;
    const data = await getWeightForRoute({ userId: req.userId, fileId, dateParam: date, exerciseId, weightId });

    if (data.error) return res.status(data.status).json({ message: data.error });

    res.json(data.weight.sets || []);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/', async (req, res) => {
  try {
    const reps = Number(req.body.reps);
    if (!Number.isFinite(reps) || reps < 0) {
      return res.status(400).json({ message: 'Number of repetitions is required' });
    }

    const { fileId, date, exerciseId, weightId } = req.params;
    const data = await getWeightForRoute({ userId: req.userId, fileId, dateParam: date, exerciseId, weightId });

    if (data.error) return res.status(data.status).json({ message: data.error });

    data.weight.sets.push(reps);
    await data.exercise.save();

    const setIndex = data.weight.sets.length - 1;
    res.status(201).json({ setIndex, reps: data.weight.sets[setIndex] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.put('/:setId', async (req, res) => {
  try {
    const reps = Number(req.body.reps);
    const setIndex = Number(req.params.setId);

    if (!Number.isFinite(reps) || reps < 0) {
      return res.status(400).json({ message: 'Enter a valid number of repetitions (positive number)' });
    }

    if (!Number.isInteger(setIndex) || setIndex < 0) {
      return res.status(400).json({ message: 'Set index must be a non-negative integer' });
    }

    const { fileId, date, exerciseId, weightId } = req.params;
    const data = await getWeightForRoute({ userId: req.userId, fileId, dateParam: date, exerciseId, weightId });

    if (data.error) return res.status(data.status).json({ message: data.error });
    if (setIndex >= data.weight.sets.length) return res.status(404).json({ message: 'Set not found' });

    data.weight.sets[setIndex] = reps;
    await data.exercise.save();

    res.status(200).json({ setIndex, reps: data.weight.sets[setIndex] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/:setId', async (req, res) => {
  try {
    const reps = Number(req.body.reps);
    const setIndex = Number(req.params.setId);

    if (!Number.isFinite(reps) || reps < 0) {
      return res.status(400).json({ message: 'Enter a valid number of repetitions (positive number)' });
    }

    if (!Number.isInteger(setIndex) || setIndex < 0) {
      return res.status(400).json({ message: 'Set index must be a non-negative integer' });
    }

    const { fileId, date, exerciseId, weightId } = req.params;
    const data = await getWeightForRoute({ userId: req.userId, fileId, dateParam: date, exerciseId, weightId });

    if (data.error) return res.status(data.status).json({ message: data.error });
    if (setIndex >= data.weight.sets.length) return res.status(404).json({ message: 'Set not found' });

    data.weight.sets[setIndex] = reps;
    await data.exercise.save();

    res.status(200).json({ setIndex, reps: data.weight.sets[setIndex] });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/:setId', async (req, res) => {
  try {
    const setIndex = Number(req.params.setId);
    if (!Number.isInteger(setIndex) || setIndex < 0) {
      return res.status(400).json({ message: 'Set index must be a non-negative integer' });
    }

    const { fileId, date, exerciseId, weightId } = req.params;
    const data = await getWeightForRoute({ userId: req.userId, fileId, dateParam: date, exerciseId, weightId });

    if (data.error) return res.status(data.status).json({ message: data.error });
    if (setIndex >= data.weight.sets.length) return res.status(404).json({ message: 'Set not found' });

    data.weight.sets.splice(setIndex, 1);
    await data.exercise.save();

    res.status(200).json({ message: 'Set deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
