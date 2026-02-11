import express from 'express';
import User from '../models/User.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

// Вспомогательная функция: проверяет, менялся ли день, и если да – сбрасывает питание
async function checkAndResetNutrition(user) {
	const now = new Date();
	const today = now.toISOString().split('T')[0]; // '2026-02-11'

	// Если lastNutritionReset не задан – это первый вход, устанавливаем сегодня и не сбрасываем
	if (!user.lastNutritionReset) {
		user.lastNutritionReset = now;
		user.nutritions = { water: 0, meal: 0, protein: 0, vitamin: 0 };
		await user.save();
		return true; // был сброс (инициализация)
	}

	// Сравниваем даты (игнорируем время)
	const lastResetDay = user.lastNutritionReset.toISOString().split('T')[0];

	if (lastResetDay !== today) {
		// День изменился – сбрасываем
		user.nutritions = { water: 0, meal: 0, protein: 0, vitamin: 0 };
		user.lastNutritionReset = now;
		await user.save();
		return true; // был сброс
	}

	return false; // сброс не требуется
}

// Получить питание пользователя
router.get('/', async (req, res) => {
	try {
		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({ message: 'Пользователь не найден' });
		}

		// Проверяем и сбрасываем при необходимости
		await checkAndResetNutrition(user);

		// Инициализируем объект питания, если его нет
		if (!user.nutritions) {
			user.nutritions = { water: 0, meal: 0, protein: 0, vitamin: 0 };
			await user.save();
		}

		res.json({
			success: true,
			nutritions: user.nutritions
		});
	} catch (err) {
		console.error('❌ Ошибка получения питания:', err);
		res.status(500).json({
			success: false,
			message: 'Ошибка сервера при получении данных питания'
		});
	}
});


// Увеличить счетчик определенного типа питания
router.post('/increment', async (req, res) => {
	try {
		const { type } = req.body;

		if (!type) {
			return res.status(400).json({
				success: false,
				message: 'Тип питания обязателен'
			});
		}

		const validTypes = ['water', 'meal', 'protein', 'vitamin'];
		if (!validTypes.includes(type)) {
			return res.status(400).json({
				success: false,
				message: 'Неверный тип питания',
				validTypes
			});
		}

		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'Пользователь не найден'
			});
		}
		// Проверяем и сбрасываем при необходимости
		await checkAndResetNutrition(user);

		// Инициализируем nutritions, если их нет
		if (!user.nutritions) {
			user.nutritions = { water: 0, meal: 0, protein: 0, vitamin: 0 };
		}

		// Увеличиваем счетчик
		user.nutritions[type] = (user.nutritions[type] || 0) + 1;

		await user.save();

		res.json({
			success: true,
			nutritions: user.nutritions,
			message: `✅ Счетчик ${type} увеличен до ${user.nutritions[type]}`
		});
	} catch (err) {
		console.error('❌ Ошибка увеличения питания:', err);
		res.status(500).json({
			success: false,
			message: 'Ошибка сервера при увеличении счетчика'
		});
	}
});

// Уменьшить счетчик определенного типа питания (не ниже 0)
router.post('/decrement', async (req, res) => {
	try {
		const { type } = req.body;

		if (!type) {
			return res.status(400).json({
				success: false,
				message: 'Тип питания обязателен'
			});
		}

		const validTypes = ['water', 'meal', 'protein', 'vitamin'];
		if (!validTypes.includes(type)) {
			return res.status(400).json({
				success: false,
				message: 'Неверный тип питания',
				validTypes
			});
		}

		const user = await User.findById(req.userId);
		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'Пользователь не найден'
			});
		}

		// Проверяем и сбрасываем при необходимости
		await checkAndResetNutrition(user);

		// Инициализируем nutritions, если их нет
		if (!user.nutritions) {
			user.nutritions = { water: 0, meal: 0, protein: 0, vitamin: 0 };
		}

		// Текущее значение счетчика (по умолчанию 0)
		const currentValue = user.nutritions[type] || 0;

		// Уменьшаем, но не ниже 0
		user.nutritions[type] = Math.max(0, currentValue - 1);

		await user.save();

		res.json({
			success: true,
			nutritions: user.nutritions,
			message: `✅ Счетчик ${type} уменьшен до ${user.nutritions[type]}`
		});
	} catch (err) {
		console.error('❌ Ошибка уменьшения питания:', err);
		res.status(500).json({
			success: false,
			message: 'Ошибка сервера при уменьшении счетчика'
		});
	}
});


export default router;