import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// Получить все веса для упражнения
router.get('/', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);

		if (!file) {
			return res.status(404).json({ message: 'Файл не найден' });
		}

		const dateObj = file.dates.find(d => d.date === req.params.date);
		if (!dateObj) {
			return res.status(404).json({ message: 'Дата не найдена' });
		}

		const exercise = dateObj.exercises.id(req.params.exerciseId);
		if (!exercise) {
			return res.status(404).json({ message: 'Упражнение не найдено' });
		}

		res.json(exercise.weights || []);
	} catch (err) {
		console.error('Error fetching weights:', err);
		res.status(500).json({ message: err.message });
	}
});

// Добавить вес
router.post('/', async (req, res) => {
	try {
		const { weight } = req.body;
		const { fileId, date, exerciseId } = req.params;

		if (!weight || weight <= 0) {
			return res.status(400).json({ message: 'Введите корректный вес (положительное число)' });
		}

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);

		if (!file) {
			return res.status(404).json({ message: 'Файл не найден' });
		}

		const dateObj = file.dates.find(d => d.date === date);
		if (!dateObj) {
			return res.status(404).json({ message: 'Дата не найдена' });
		}

		const exercise = dateObj.exercises.id(exerciseId);
		if (!exercise) {
			return res.status(404).json({ message: 'Упражнение не найдено' });
		}

		// Создаем новый вес
		const newWeight = {
			_id: new mongoose.Types.ObjectId(),
			weight: parseFloat(weight),
			sets: [],
		};

		// Добавляем вес к упражнению
		exercise.weights.push(newWeight);
		await user.save();

		res.status(201).json(newWeight);
	} catch (err) {
		console.error('Error adding weight:', err);
		res.status(500).json({ message: err.message });
	}
});

// Обновить вес
router.put('/:weightId', async (req, res) => {
	try {
		const { weight } = req.body;
		const { fileId, date, exerciseId, weightId } = req.params;

		if (typeof weight !== 'number' || weight <= 0) {
			return res.status(400).json({ message: 'Введите корректный вес (положительное число)' });
		}

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);

		if (!file) {
			return res.status(404).json({ message: 'Файл не найден' });
		}

		const dateObj = file.dates.find(d => d.date === date);
		if (!dateObj) {
			return res.status(404).json({ message: 'Дата не найдена' });
		}

		const exercise = dateObj.exercises.id(exerciseId);
		if (!exercise) {
			return res.status(404).json({ message: 'Упражнение не найдено' });
		}

		const weightObj = exercise.weights.id(weightId);
		if (!weightObj) {
			return res.status(404).json({ message: 'Вес не найден' });
		}

		// Обновляем вес
		weightObj.weight = weight;
		await user.save();

		res.json(weightObj);
	} catch (err) {
		console.error('Error updating weight:', err);
		res.status(500).json({ message: err.message });
	}
});

// Удалить вес
router.delete('/:weightId', async (req, res) => {
	try {
		const { fileId, date, exerciseId, weightId } = req.params;

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);

		if (!file) {
			return res.status(404).json({ message: 'Файл не найден' });
		}

		const dateObj = file.dates.find(d => d.date === date);
		if (!dateObj) {
			return res.status(404).json({ message: 'Дата не найдена' });
		}

		const exercise = dateObj.exercises.id(exerciseId);
		if (!exercise) {
			return res.status(404).json({ message: 'Упражнение не найдено' });
		}

		const weightObj = exercise.weights.id(weightId);
		if (!weightObj) {
			return res.status(404).json({ message: 'Вес не найден' });
		}

		// Удаляем вес
		exercise.weights.pull(weightId);
		await user.save();

		res.status(200).json({ message: 'Вес успешно удален' });
	} catch (err) {
		console.error('Error deleting weight:', err);
		res.status(500).json({ message: err.message });
	}
});

export default router;