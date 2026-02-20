import express from 'express';
import TrainingFile from '../models/TrainingFile.js';
import TrainingDate from '../models/TrainingDate.js';
import ExerciseEntry from '../models/ExerciseEntry.js';
import Template from '../models/Template.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

router.get('/', async (req, res) => {
	try {
		const files = await TrainingFile.find({ userId: req.userId }).sort({ order: 1, createdAt: 1 });
		res.json(files);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post('/', async (req, res) => {
	const { name } = req.body;
	try {
		if (!name || !name.trim()) {
			return res.status(400).json({ message: 'Название тренировки обязательно' });
		}

		const count = await TrainingFile.countDocuments({ userId: req.userId });
		const file = await TrainingFile.create({
			userId: req.userId,
			name: name.trim(),
			order: count,
		});

		res.status(201).json(file);
	} catch (err) {
		if (err?.code === 11000) {
			return res.status(400).json({ message: 'Тренировка с таким названием уже существует' });
		}
		res.status(400).json({ message: 'Ошибка создания тренировки' });
	}
});

router.get('/:fileId', async (req, res) => {
	try {
		const file = await TrainingFile.findOne({ _id: req.params.fileId, userId: req.userId });
		if (!file) return res.status(404).json({ message: 'Файл не найден' });
		res.json(file);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.put('/:fileId', async (req, res) => {
	try {
		const { name } = req.body;

		if (!name || name.trim() === '') {
			return res.status(400).json({ message: 'Название тренировки обязательно' });
		}

		const file = await TrainingFile.findOneAndUpdate(
			{ _id: req.params.fileId, userId: req.userId },
			{ $set: { name: name.trim() } },
			{ new: true, runValidators: true }
		);

		if (!file) {
			return res.status(404).json({ message: 'Тренировка не найдена' });
		}

		res.json({
			success: true,
			message: 'Тренировка успешно обновлена',
			training: file,
		});
	} catch (err) {
		if (err?.code === 11000) {
			return res.status(400).json({ message: 'Тренировка с таким названием уже существует' });
		}
		res.status(500).json({
			message: 'Ошибка при обновлении тренировки',
			error: err.message,
		});
	}
});

router.delete('/:fileId', async (req, res) => {
	try {
		const { fileId } = req.params;

		const deletedFile = await TrainingFile.findOneAndDelete({ _id: fileId, userId: req.userId });
		if (!deletedFile) return res.status(404).json({ message: 'Файл не найден' });

		const dates = await TrainingDate.find({ userId: req.userId, trainingFileId: fileId }).select('_id');
		const dateIds = dates.map((d) => d._id);

		await Promise.all([
			TrainingDate.deleteMany({ userId: req.userId, trainingFileId: fileId }),
			Template.deleteMany({ userId: req.userId, trainingFileId: fileId }),
			ExerciseEntry.deleteMany({ userId: req.userId, trainingFileId: fileId }),
			dateIds.length
				? ExerciseEntry.deleteMany({ userId: req.userId, trainingDateId: { $in: dateIds } })
				: Promise.resolve(),
		]);

		res.json({
			success: true,
			message: 'Файл удалён',
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: err.message,
		});
	}
});

router.post('/order', async (req, res) => {
	try {
		const { order } = req.body;

		if (!order || !Array.isArray(order)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid order data: order must be an array',
			});
		}

		const validIds = order.filter((id) => typeof id === 'string' && id.trim());
		const bulkOps = validIds.map((id, index) => ({
			updateOne: {
				filter: { _id: id, userId: req.userId },
				update: { $set: { order: index } },
			},
		}));

		if (bulkOps.length) {
			await TrainingFile.bulkWrite(bulkOps);
		}

		const savedOrderDocs = await TrainingFile.find({ userId: req.userId }).sort({ order: 1, createdAt: 1 }).select('_id');

		res.json({
			success: true,
			message: 'Order saved successfully',
			savedOrder: savedOrderDocs.map((d) => d._id.toString()),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Server error',
			error: process.env.NODE_ENV === 'development' ? error.message : undefined,
		});
	}
});

export default router;
