import express from 'express';
import User from '../models/User.js';
import {
	register,
	login,
	getProfile,
	updateProfile,
} from '../controllers/authController.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

router.get('/profile', authMiddleware, getProfile);
router.post('/profile', authMiddleware, updateProfile);
router.get('/me', authMiddleware, getProfile);

router.get('/users', async (req, res) => {
	try {
		const users = await User.find({}, 'email name');
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post('/google', async (req, res) => {
	try {
		res.status(501).json({
			success: false,
			message: 'Google authentication not implemented yet',
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Server error',
		});
	}
});

export default router;
