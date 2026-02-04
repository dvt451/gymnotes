import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// Вспомогательная функция для нормализации даты
const normalizeDate = (dateStr) => {
	if (!dateStr) return null;

	if (typeof dateStr === 'string' && dateStr.includes('T')) {
		return dateStr.split('T')[0];
	}

	if (dateStr instanceof Date) {
		const year = dateStr.getFullYear();
		const month = String(dateStr.getMonth() + 1).padStart(2, '0');
		const day = String(dateStr.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	return dateStr;
};

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

// Применить шаблон упражнений к дате
router.post('/apply-template', async (req, res) => {
	try {
		const { exercises: templateExercises } = req.body;
		const { fileId, date: requestedDate } = req.params;

		console.log('Applying template:', {
			fileId,
			requestedDate,
			templateExercises
		});

		if (!templateExercises || !Array.isArray(templateExercises)) {
			return res.status(400).json({ message: 'Неверный формат упражнений в шаблоне' });
		}

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);

		if (!file) {
			return res.status(404).json({ message: 'Файл не найден' });
		}

		console.log('File found:', file.name);
		console.log('Dates in file:', file.dates.map(d => ({
			rawDate: d.date,
			normalizedDate: normalizeDate(d.date)
		})));

		// Ищем дату, нормализуя для сравнения
		let dateEntry = file.dates.find(d => {
			const normalizedDbDate = normalizeDate(d.date);
			const normalizedRequestDate = normalizeDate(requestedDate);
			console.log('Comparing dates:', {
				dbDate: d.date,
				normalizedDbDate,
				requestedDate,
				normalizedRequestDate,
				match: normalizedDbDate === normalizedRequestDate
			});
			return normalizedDbDate === normalizedRequestDate;
		});

		// Если дата не найдена, создаем новую
		if (!dateEntry) {
			console.log('Date not found, creating new one');
			dateEntry = {
				_id: new mongoose.Types.ObjectId(),
				date: requestedDate,
				exercises: []
			};
			file.dates.push(dateEntry);
		}

		console.log('Date object:', dateEntry);
		console.log('Template exercises to add:', templateExercises);

		// Создаем новые упражнения из шаблона
		const newExercises = templateExercises.map(exercise => ({
			_id: new mongoose.Types.ObjectId(),
			name: exercise.name,
			weights: []
		}));

		console.log('New exercises to add:', newExercises);

		// Добавляем упражнения к дате
		if (!dateEntry.exercises) {
			dateEntry.exercises = [];
		}

		dateEntry.exercises.push(...newExercises);
		await user.save();

		console.log('Template applied successfully');

		// Возвращаем добавленные упражнения
		const addedExercises = dateEntry.exercises.slice(-newExercises.length);
		res.status(201).json(addedExercises);
	} catch (err) {
		console.error('Ошибка при применении шаблона:', err);
		res.status(500).json({
			message: err.message,
			stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
		});
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

// Добавим тестовый маршрут для проверки
router.get('/test-apply-template', (req, res) => {
	res.json({
		message: 'Apply template endpoint is accessible',
		params: req.params,
		timestamp: new Date().toISOString()
	});
});

export default router;