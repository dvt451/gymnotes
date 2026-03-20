import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import TrainingFile from '../models/TrainingFile.js';
import TrainingDate from '../models/TrainingDate.js';
import ExerciseEntry from '../models/ExerciseEntry.js';
import Template from '../models/Template.js';
import ExerciseUserLibrary from '../models/ExerciseUserLibrary.js';
import { generateToken } from '../utils/jwt.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { validateLogin } from '../middleware/validation.js';

const router = express.Router();

const serializeAdminUser = (user) => ({
	id: user._id,
	name: user.name,
	email: user.email,
	weight: user.weight,
	role: user.role || 'user',
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

router.post('/login', validateLogin, async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email }).select('+password');
		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials',
			});
		}

		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials',
			});
		}

		if (user.role !== 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Admin access required',
			});
		}

		const token = generateToken(user);

		res.json({
			success: true,
			message: 'Admin logged in successfully',
			token,
			user: serializeAdminUser(user),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Server error during admin login',
		});
	}
});

router.use(authMiddleware, requireAdmin);

router.get('/me', async (req, res) => {
	res.json({
		success: true,
		user: serializeAdminUser(req.currentUser),
	});
});

router.get('/overview', async (req, res) => {
	try {
		const [totalUsers, totalAdmins, totalTrainings, totalTrainingDates, totalExercises, totalTemplates] =
			await Promise.all([
				User.countDocuments(),
				User.countDocuments({ role: 'admin' }),
				TrainingFile.countDocuments(),
				TrainingDate.countDocuments(),
				ExerciseEntry.countDocuments(),
				Template.countDocuments(),
			]);

		res.json({
			success: true,
			overview: {
				totalUsers,
				totalAdmins,
				totalTrainings,
				totalTrainingDates,
				totalExercises,
				totalTemplates,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to load admin overview',
		});
	}
});

router.get('/users', async (req, res) => {
	try {
		const users = await User.find({})
			.select('name email role weight createdAt updatedAt')
			.sort({ createdAt: -1, _id: -1 })
			.lean();

		const userIds = users.map((user) => user._id);
		const [trainingCounts, libraryCounts] = await Promise.all([
			TrainingFile.aggregate([
				{ $match: { userId: { $in: userIds } } },
				{ $group: { _id: '$userId', count: { $sum: 1 } } },
			]),
			ExerciseUserLibrary.aggregate([
				{ $match: { userId: { $in: userIds } } },
				{ $group: { _id: '$userId', count: { $sum: 1 } } },
			]),
		]);

		const trainingCountByUser = new Map(
			trainingCounts.map((item) => [String(item._id), item.count])
		);
		const libraryCountByUser = new Map(
			libraryCounts.map((item) => [String(item._id), item.count])
		);

		res.json({
			success: true,
			users: users.map((user) => ({
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role || 'user',
				weight: user.weight,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
				trainingCount: trainingCountByUser.get(String(user._id)) || 0,
				customExerciseCount: libraryCountByUser.get(String(user._id)) || 0,
			})),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to load users',
		});
	}
});

router.patch('/users/:userId/role', async (req, res) => {
	try {
		const { userId } = req.params;
		const { role } = req.body || {};

		if (!mongoose.isValidObjectId(userId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid user id',
			});
		}

		if (!['user', 'admin'].includes(role)) {
			return res.status(400).json({
				success: false,
				message: 'Role must be either user or admin',
			});
		}

		const targetUser = await User.findById(userId);
		if (!targetUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		if (targetUser.role === role) {
			return res.json({
				success: true,
				message: 'Role unchanged',
				user: serializeAdminUser(targetUser),
			});
		}

		if (
			String(targetUser._id) === String(req.currentUser._id) &&
			role !== 'admin'
		) {
			const adminCount = await User.countDocuments({ role: 'admin' });
			if (adminCount <= 1) {
				return res.status(400).json({
					success: false,
					message: 'You cannot remove the last admin role from your own account',
				});
			}
		}

		targetUser.role = role;
		await targetUser.save();

		res.json({
			success: true,
			message: 'User role updated successfully',
			user: serializeAdminUser(targetUser),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update user role',
		});
	}
});

export default router;
