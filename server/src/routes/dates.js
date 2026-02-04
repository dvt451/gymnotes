// routes/dates.js
import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// Получить все даты для тренировки
router.get('/', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		res.json(file.dates || []);
	} catch (err) {
		console.error('Ошибка получения дат:', err);
		res.status(500).json({ message: err.message });
	}
});

// Получить конкретную дату
router.get('/:date', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		const dateEntry = file.dates.find(d => {
			if (!d.date) return false;
			const dStr = d.date instanceof Date ? d.date.toISOString().split('T')[0] : d.date.split('T')[0];
			return dStr === req.params.date;
		});

		if (!dateEntry) return res.status(404).json({ message: 'Дата не найдена' });

		res.json(dateEntry);
	} catch (err) {
		console.error('Ошибка получения даты:', err);
		res.status(500).json({ message: err.message });
	}
});

// Добавить дату
router.post('/', async (req, res) => {
	try {
		const { date, exercises } = req.body;
		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		if (file.dates.some(d => d.date === date))
			return res.status(400).json({ message: 'Дата уже существует' });

		file.dates.push({
			date,
			exercises: exercises || []
		});
		await user.save();

		const newDate = file.dates[file.dates.length - 1];
		res.status(201).json(newDate);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Удалить дату
router.delete('/:dateId', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		const dateIndex = file.dates.findIndex(d => d._id.toString() === req.params.dateId);
		if (dateIndex === -1) return res.status(404).json({ message: 'Дата не найдена' });

		file.dates.splice(dateIndex, 1);
		await user.save();

		res.json({ success: true, message: 'Дата удалена' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;