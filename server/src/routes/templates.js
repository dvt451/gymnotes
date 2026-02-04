import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.use(authMiddleware);

// ==================== TEMPLATES ====================

// Получить все шаблоны для тренировки
router.get('/:fileId/templates', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		res.json(file.templates || []);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Добавить шаблон
router.post('/:fileId/templates', async (req, res) => {
	try {
		const { name, exercises } = req.body;
		if (!name) return res.status(400).json({ message: 'Имя шаблона обязательно' });

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		file.templates.push({
			name,
			exercises: Array.isArray(exercises) ? exercises : []
		});
		await user.save();

		const savedTemplate = file.templates[file.templates.length - 1];
		res.status(201).json(savedTemplate);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Обновить шаблон
router.put('/:fileId/templates/:templateId', async (req, res) => {
	try {
		const { name, exercises } = req.body;
		if (!name) return res.status(400).json({ message: 'Имя шаблона обязательно' });

		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		const template = file.templates.id(req.params.templateId);
		if (!template) return res.status(404).json({ message: 'Шаблон не найден' });

		template.name = name;
		template.exercises = Array.isArray(exercises) ? exercises : [];
		await user.save();

		res.json(template);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Удалить шаблон
router.delete('/:fileId/templates/:templateId', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		const file = user.trainingfiles.id(req.params.fileId);
		if (!file) return res.status(404).json({ message: 'Файл не найден' });

		const template = file.templates.id(req.params.templateId);
		if (!template) return res.status(404).json({ message: 'Шаблон не найден' });

		file.templates.pull(req.params.templateId);
		await user.save();

		res.status(200).json({ message: 'Шаблон удалён' });
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

export default router;