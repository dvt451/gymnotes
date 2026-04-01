import express from 'express';
import User from '../models/User.js';
import {
	register,
	login,
	loginWithGoogle,
	getProfile,
	updateProfile,
} from '../controllers/authController.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { validateRegister, validateLogin } from '../middleware/validation.js';

const router = express.Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

router.get('/profile', authMiddleware, getProfile);
router.post('/profile', authMiddleware, updateProfile);
router.get('/me', authMiddleware, getProfile);

router.get('/users', authMiddleware, requireAdmin, async (req, res) => {
	try {
		const users = await User.find({}, 'email name role');
		res.json(users);
	} catch (err) {
		res.status(500).json({ message: err.message });
	}
});

router.post('/google', loginWithGoogle);

export default router;
