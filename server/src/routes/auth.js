import express from 'express';
import {
	register,
	login,
	getProfile,
	updateProfile
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Публичные маршруты
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Защищенные маршруты
router.get('/profile', authMiddleware, getProfile);
router.post('/profile', authMiddleware, updateProfile);
router.get('/me', authMiddleware, getProfile);

// Временный endpoint для отладки
router.get('/users', async (req, res) => {
	try {
		const users = await User.find({}, 'email name');
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

// Google аутентификация (заглушка - нужно будет доработать)
router.post('/google', async (req, res) => {
	try {
		const { token } = req.body;

		// TODO: Реализовать проверку Google токена
		// Пока возвращаем ошибку
		res.status(501).json({
			success: false,
			message: 'Google authentication not implemented yet'
		});
	} catch (err) {
		console.error('Google auth error:', err);
		res.status(500).json({
			success: false,
			message: 'Server error'
		});
	}
});

export default router;