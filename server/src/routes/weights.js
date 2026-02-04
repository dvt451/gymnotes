import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// Получить все веса для упражнения
router.get('/', async (req, res) => {
	try {
		// Здесь нужно получить конкретное упражнение и вернуть его weights
		// Пока оставляю заглушку
		res.json({ message: 'Get weights endpoint' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Добавить вес
router.post('/', async (req, res) => {
	try {
		const { weight } = req.body;
		const { exerciseId } = req.params;

		// Здесь логика добавления веса к упражнению
		// Пока оставляю заглушку
		const newWeight = {
			_id: new mongoose.Types.ObjectId(),
			weight,
			sets: [],
		};

		// Нужно найти упражнение и добавить вес
		res.status(201).json(newWeight);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Обновить вес
router.put('/:weightId', async (req, res) => {
	try {
		const { weight } = req.body;

		if (typeof weight !== 'number' || weight <= 0) {
			return res.status(400).json({ message: 'Введите корректный вес (положительное число)' });
		}

		// Логика обновления веса
		res.json({ weight });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Удалить вес
router.delete('/:weightId', async (req, res) => {
	try {
		// Логика удаления веса
		res.status(200).json({ message: 'Вес успешно удален' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;