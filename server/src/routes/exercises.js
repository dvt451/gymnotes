import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// Получить все упражнения для даты
router.get('/', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		const dateEntry = file.dates.find(d => {
			if (!d.date) return false;
			const dateStr = d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date.split('T')[0];
			return dateStr === req.params.date;
		});

		if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

		res.json({ exercises: dateEntry.exercises || [] });
	} catch (err) {
		console.error('Ошибка получения упражнений по дате:', err);
		res.status(500).json({ message: err.message });
	}
});

// Добавить упражнение
router.post('/', async (req, res) => {
	try {
		const { name } = req.body;
		if (!name) return res.status(400).json({ message: 'Имя упражнения обязательно' });

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		const dateEntry = file.dates.find(d => {
			if (!d.date) return false;
			const dateStr = d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date.split('T')[0];
			return dateStr === req.params.date;
		});

		if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

		const newExercise = {
			_id: new mongoose.Types.ObjectId(),
			name,
			weights: [],
		};

		dateEntry.exercises.push(newExercise);
		await user.save();

		res.status(201).json(newExercise);
	} catch (err) {
		console.error('Ошибка добавления упражнения:', err);
		res.status(500).json({ message: 'Ошибка добавления упражнения' });
	}
});

// Обновить упражнение
router.put('/:exerciseId', async (req, res) => {
	try {
		const { name } = req.body;
		if (!name) return res.status(400).json({ message: 'Имя упражнения обязательно' });

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		const dateEntry = file.dates.find(d => {
			if (!d.date) return false;
			const dateStr = d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date.split('T')[0];
			return dateStr === req.params.date;
		});

		if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

		const exercise = dateEntry.exercises.id(req.params.exerciseId);
		if (!exercise) return res.status(404).json({ message: 'Упражнение не найдено' });

		exercise.name = name;
		await user.save();

		res.json(exercise);
	} catch (err) {
		console.error('Ошибка обновления упражнения:', err);
		res.status(500).json({ message: err.message });
	}
});

// Удалить упражнение
router.delete('/:exerciseId', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		const dateEntry = file.dates.find(d => {
			if (!d.date) return false;
			const dateStr = d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date.split('T')[0];
			return dateStr === req.params.date;
		});

		if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

		const exerciseIndex = dateEntry.exercises.findIndex(e => e._id.toString() === req.params.exerciseId);
		if (exerciseIndex === -1) return res.status(404).json({ message: 'Упражнение не найдено' });

		dateEntry.exercises.splice(exerciseIndex, 1);
		await user.save();

		res.status(200).json({ message: 'Упражнение успешно удалено' });
	} catch (err) {
		console.error('Ошибка при удалении упражнения:', err);
		res.status(500).json({ message: 'Ошибка на сервере при удалении упражнения' });
	}
});

export default router;