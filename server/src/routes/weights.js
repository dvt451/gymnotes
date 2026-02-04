import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// Вспомогательная функция для нормализации даты
const normalizeDate = (dateStr) => {
	if (!dateStr) return null;

	// Если это ISO строка (с T), берем только дату
	if (typeof dateStr === 'string' && dateStr.includes('T')) {
		return dateStr.split('T')[0];
	}

	// Если это объект Date, форматируем
	if (dateStr instanceof Date) {
		const year = dateStr.getFullYear();
		const month = String(dateStr.getMonth() + 1).padStart(2, '0');
		const day = String(dateStr.getDate()).padStart(2, '0');
		return `${year}-${month}-${day}`;
	}

	// Иначе возвращаем как есть (уже в формате YYYY-MM-DD)
	return dateStr;
};

// Получить все веса для упражнения
router.get('/', async (req, res) => {
	try {
		const { fileId, date: requestedDate, exerciseId } = req.params;

		console.log('GET weights params:', { fileId, requestedDate, exerciseId });

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);

		if (!file) {
			return res.status(404).json({ message: 'Файл не найден' });
		}

		// Ищем дату, нормализуя для сравнения
		const dateObj = file.dates.find(d => {
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

		if (!dateObj) {
			return res.status(404).json({
				message: 'Дата не найдена',
				requestedDate,
				normalizedRequestedDate: normalizeDate(requestedDate),
				availableDates: file.dates.map(d => ({
					rawDate: d.date,
					normalizedDate: normalizeDate(d.date)
				}))
			});
		}

		const exercise = dateObj.exercises.id(exerciseId);
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
		const { fileId, date: requestedDate, exerciseId } = req.params;

		console.log('POST weight params:', { fileId, requestedDate, exerciseId, weight });

		if (!weight || weight <= 0) {
			return res.status(400).json({ message: 'Введите корректный вес (положительное число)' });
		}

		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({ message: 'Пользователь не найден' });
		}

		const file = user.trainingfiles.id(fileId);
		if (!file) {
			return res.status(404).json({
				message: 'Файл не найден',
				fileId,
				availableFiles: user.trainingfiles.map(f => f._id)
			});
		}

		console.log('File found:', file.name);
		console.log('Dates in file:', file.dates.map(d => ({
			rawDate: d.date,
			normalizedDate: normalizeDate(d.date)
		})));

		// Ищем дату, нормализуя для сравнения
		const dateObj = file.dates.find(d => {
			const normalizedDbDate = normalizeDate(d.date);
			const normalizedRequestDate = normalizeDate(requestedDate);
			return normalizedDbDate === normalizedRequestDate;
		});

		if (!dateObj) {
			return res.status(404).json({
				message: 'Дата не найдена',
				requestedDate,
				normalizedRequestedDate: normalizeDate(requestedDate),
				availableDates: file.dates.map(d => ({
					rawDate: d.date,
					normalizedDate: normalizeDate(d.date)
				}))
			});
		}

		console.log('Date object found');
		console.log('Exercises in date:', dateObj.exercises.map(e => ({ id: e._id, name: e.name })));

		const exercise = dateObj.exercises.id(exerciseId);
		if (!exercise) {
			return res.status(404).json({
				message: 'Упражнение не найдено',
				exerciseId,
				availableExercises: dateObj.exercises.map(e => ({ id: e._id, name: e.name }))
			});
		}

		console.log('Exercise found:', exercise.name);

		// Создаем новый вес
		const newWeight = {
			_id: new mongoose.Types.ObjectId(),
			weight: parseFloat(weight),
			sets: [],
		};

		console.log('Creating new weight:', newWeight);

		// Добавляем вес к упражнению
		if (!exercise.weights) {
			exercise.weights = [];
		}
		exercise.weights.push(newWeight);

		await user.save();

		console.log('Weight added successfully');

		res.status(201).json(newWeight);
	} catch (err) {
		console.error('Error adding weight:', err);
		res.status(500).json({
			message: err.message,
			stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
		});
	}
});

// Обновить вес
router.put('/:weightId', async (req, res) => {
	try {
		const { weight } = req.body;
		const { fileId, date: requestedDate, exerciseId, weightId } = req.params;

		if (typeof weight !== 'number' || weight <= 0) {
			return res.status(400).json({ message: 'Введите корректный вес (положительное число)' });
		}

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);

		if (!file) {
			return res.status(404).json({ message: 'Файл не найден' });
		}

		// Ищем дату, нормализуя для сравнения
		const dateObj = file.dates.find(d => {
			const normalizedDbDate = normalizeDate(d.date);
			const normalizedRequestDate = normalizeDate(requestedDate);
			return normalizedDbDate === normalizedRequestDate;
		});

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
		const { fileId, date: requestedDate, exerciseId, weightId } = req.params;

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(fileId);

		if (!file) {
			return res.status(404).json({ message: 'Файл не найден' });
		}

		// Ищем дату, нормализуя для сравнения
		const dateObj = file.dates.find(d => {
			const normalizedDbDate = normalizeDate(d.date);
			const normalizedRequestDate = normalizeDate(requestedDate);
			return normalizedDbDate === normalizedRequestDate;
		});

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

// Тестовый маршрут для проверки
router.get('/test', (req, res) => {
	res.json({
		message: 'Weights router is working',
		params: req.params,
		timestamp: new Date().toISOString()
	});
});

export default router;