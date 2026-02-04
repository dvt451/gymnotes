import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Получить все training files
router.get('/', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		res.json(user.trainingfiles || []);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Создать новый training file
router.post('/', async (req, res) => {
	const { name, text } = req.body;
	try {
		const user = await User.findById(req.userId);
		if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

		const newFile = {
			name,
			text,
			dates: [],
			templates: [],
		};

		user.trainingfiles.push(newFile);
		await user.save();

		const savedFile = user.trainingfiles[user.trainingfiles.length - 1];
		res.status(201).json(savedFile);
	} catch (err) {
		console.error('Ошибка создания тренировки:', err);
		res.status(400).json({ message: 'Ошибка создания тренировки' });
	}
});

// Получить один training file
router.get('/:fileId', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });
		res.json(file);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Обновить training file
router.put('/:fileId', async (req, res) => {
	try {
		const { name, text } = req.body;
		const { fileId } = req.params;

		if (!name || name.trim() === '') {
			return res.status(400).json({ message: 'Название тренировки обязательно' });
		}

		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({ message: 'Пользователь не найден' });
		}

		const file = user.trainingfiles.id(fileId);
		if (!file) {
			return res.status(404).json({ message: 'Тренировка не найдена' });
		}

		file.name = name.trim();
		file.text = text ? text.trim() : '';

		await user.save();

		res.json({
			success: true,
			message: 'Тренировка успешно обновлена',
			training: file
		});
	} catch (err) {
		console.error('Ошибка обновления тренировки:', err);
		res.status(500).json({
			message: 'Ошибка при обновлении тренировки',
			error: err.message
		});
	}
});

// Удалить training file
router.delete('/:fileId', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		if (!user) return res.status(404).json({ message: 'Пользователь не найден' });

		user.trainingfiles = user.trainingfiles.filter(f => f._id.toString() !== req.params.fileId);
		await user.save();

		res.json({
			success: true,
			message: 'Файл удалён'
		});
	} catch (err) {
		console.error('Ошибка удаления файла:', err);
		res.status(500).json({
			success: false,
			message: err.message
		});
	}
});

// Сохранить порядок тренировок
router.post('/order', async (req, res) => {
	try {
		const userId = req.userId;
		const { order } = req.body;

		if (!order || !Array.isArray(order)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid order data: order must be an array'
			});
		}

		if (!userId) {
			return res.status(401).json({
				success: false,
				message: 'User not authenticated'
			});
		}

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		user.trainingOrder = order;
		await user.save();

		res.json({
			success: true,
			message: 'Order saved successfully',
			savedOrder: user.trainingOrder
		});
	} catch (error) {
		console.error('❌ Error saving order:', error);
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
});

export default router;