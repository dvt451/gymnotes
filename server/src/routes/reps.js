import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// Получить все подходы для веса
router.get('/', async (req, res) => {
	try {
		const { fileId, date, exerciseId, weightId } = req.params;

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);
		if (!file) return res.status(404).json({ message: 'File not found' });

		const trainingDate = file.dates.find(d => {
			if (!d.date) return false;
			const dateStr = d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date.split('T')[0];
			return dateStr === date;
		});
		if (!trainingDate) return res.status(404).json({ message: 'Date not found' });

		const exercise = trainingDate.exercises.id(exerciseId);
		if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

		const weight = exercise.weights.id(weightId);
		if (!weight) return res.status(404).json({ message: 'Weight not found' });

		res.json(weight.sets || []);
	} catch (err) {
		console.error('Error getting sets:', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// Добавить подход
router.post('/', async (req, res) => {
	try {
		const { reps } = req.body;
		const { fileId, date, exerciseId, weightId } = req.params;

		if (!reps && reps !== 0) {
			return res.status(400).json({ message: 'Number of repetitions is required' });
		}

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);
		if (!file) return res.status(404).json({ message: 'File not found' });

		const trainingDate = file.dates.find(d => {
			if (!d.date) return false;
			const dateStr = d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date.split('T')[0];
			return dateStr === date;
		});
		if (!trainingDate) return res.status(404).json({ message: 'Date not found' });

		const exercise = trainingDate.exercises.id(exerciseId);
		if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

		const weight = exercise.weights.id(weightId);
		if (!weight) return res.status(404).json({ message: 'Weight not found' });

		const newSet = {
			_id: new mongoose.Types.ObjectId(),
			reps
		};

		weight.sets.push(newSet);
		await user.save();

		res.status(201).json(newSet);
	} catch (err) {
		console.error('Error adding set:', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// Обновить подход
router.put('/:setId', async (req, res) => {
	try {
		const { reps } = req.body;
		const { fileId, date, exerciseId, weightId, setId } = req.params;

		if (!reps && reps !== 0) {
			return res.status(400).json({ message: 'Number of repetitions is required' });
		}

		if (typeof reps !== 'number' || reps < 0) {
			return res.status(400).json({ message: 'Enter a valid number of repetitions (positive number)' });
		}

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);
		if (!file) return res.status(404).json({ message: 'File not found' });

		const trainingDate = file.dates.find(d => {
			if (!d.date) return false;
			const dateStr = d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date.split('T')[0];
			return dateStr === date;
		});
		if (!trainingDate) return res.status(404).json({ message: 'Date not found' });

		const exercise = trainingDate.exercises.id(exerciseId);
		if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

		const weight = exercise.weights.id(weightId);
		if (!weight) return res.status(404).json({ message: 'Weight not found' });

		const set = weight.sets.id(setId);
		if (!set) return res.status(404).json({ message: 'Set not found' });

		set.reps = reps;
		await user.save();

		res.status(200).json(set);
	} catch (err) {
		console.error('Error updating set:', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// PATCH метод для совместимости
router.patch('/:setId', async (req, res) => {
	try {
		const { reps } = req.body;
		const { fileId, date, exerciseId, weightId, setId } = req.params;

		if (!reps && reps !== 0) {
			return res.status(400).json({ message: 'Number of repetitions is required' });
		}

		if (typeof reps !== 'number' || reps < 0) {
			return res.status(400).json({ message: 'Enter a valid number of repetitions (positive number)' });
		}

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);
		if (!file) return res.status(404).json({ message: 'File not found' });

		const trainingDate = file.dates.find(d => {
			if (!d.date) return false;
			const dateStr = d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date.split('T')[0];
			return dateStr === date;
		});
		if (!trainingDate) return res.status(404).json({ message: 'Date not found' });

		const exercise = trainingDate.exercises.id(exerciseId);
		if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

		const weight = exercise.weights.id(weightId);
		if (!weight) return res.status(404).json({ message: 'Weight not found' });

		const set = weight.sets.id(setId);
		if (!set) return res.status(404).json({ message: 'Set not found' });

		set.reps = reps;
		await user.save();

		res.status(200).json(set);
	} catch (err) {
		console.error('Error updating set:', err);
		res.status(500).json({ message: 'Server error' });
	}
});

// Удалить подход
router.delete('/:setId', async (req, res) => {
	try {
		const { fileId, date, exerciseId, weightId, setId } = req.params;

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);
		if (!file) return res.status(404).json({ message: 'File not found' });

		const trainingDate = file.dates.find(d => {
			if (!d.date) return false;
			const dateStr = d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date.split('T')[0];
			return dateStr === date;
		});
		if (!trainingDate) return res.status(404).json({ message: 'Date not found' });

		const exercise = trainingDate.exercises.id(exerciseId);
		if (!exercise) return res.status(404).json({ message: 'Exercise not found' });

		const weight = exercise.weights.id(weightId);
		if (!weight) return res.status(404).json({ message: 'Weight not found' });

		weight.sets.pull(setId);
		await user.save();

		res.status(200).json({ message: 'Set deleted' });
	} catch (err) {
		console.error('Error deleting set:', err);
		res.status(500).json({ message: 'Server error' });
	}
});

export default router;