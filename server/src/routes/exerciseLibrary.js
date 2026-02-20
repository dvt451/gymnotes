import express from 'express';
import mongoose from 'mongoose';
import ExerciseUserLibrary from '../models/ExerciseUserLibrary.js';
import ExerciseEntry from '../models/ExerciseEntry.js';
import Template from '../models/Template.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();

router.use(authMiddleware);

const APP_LIBRARY = [
	{ id: 'app_pushups', name: 'Pushups' },
	{ id: 'app_pullups', name: 'Pullups' },
	{ id: 'app_squat', name: 'Squat' },
	{ id: 'app_bench_press', name: 'Bench Press' },
	{ id: 'app_deadlift', name: 'Deadlift' },
];

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/', async (req, res) => {
	try {
		const userExercises = await ExerciseUserLibrary.find({ userId: req.userId })
			.sort({ name: 1, createdAt: 1 })
			.select('_id name createdAt updatedAt');

		res.json({
			appExercises: APP_LIBRARY,
			userExercises,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Failed to load exercise library',
		});
	}
});

router.post('/', async (req, res) => {
	try {
		const rawName = req.body?.name;
		if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
			return res.status(400).json({
				success: false,
				message: 'Exercise name is required',
			});
		}

		const normalizedName = rawName.trim();
		const duplicate = await ExerciseUserLibrary.findOne({
			userId: req.userId,
			name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: 'i' },
		});

		if (duplicate) {
			return res.status(409).json({
				success: false,
				message: 'Упражнение уже существует',
				existingExercise: duplicate,
			});
		}

		const created = await ExerciseUserLibrary.create({
			userId: req.userId,
			name: normalizedName,
		});

		res.status(201).json({
			success: true,
			exercise: created,
		});
	} catch (err) {
		if (err?.code === 11000) {
			return res.status(409).json({
				success: false,
				message: 'Упражнение уже существует',
			});
		}

		res.status(500).json({
			success: false,
			message: 'Failed to create exercise',
		});
	}
});

router.put('/:exerciseId', async (req, res) => {
	try {
		const { exerciseId } = req.params;
		const rawName = req.body?.name;

		if (!exerciseId || !mongoose.isValidObjectId(exerciseId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid exercise id',
			});
		}

		if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
			return res.status(400).json({
				success: false,
				message: 'Exercise name is required',
			});
		}

		const exercise = await ExerciseUserLibrary.findOne({
			_id: exerciseId,
			userId: req.userId,
		});

		if (!exercise) {
			return res.status(404).json({
				success: false,
				message: 'Exercise not found',
			});
		}

		const normalizedName = rawName.trim();
		const duplicate = await ExerciseUserLibrary.findOne({
			_id: { $ne: exerciseId },
			userId: req.userId,
			name: { $regex: `^${escapeRegex(normalizedName)}$`, $options: 'i' },
		});

		if (duplicate) {
			return res.status(409).json({
				success: false,
				message: 'Упражнение уже существует',
				existingExercise: duplicate,
			});
		}

		exercise.name = normalizedName;
		await exercise.save();

		res.json({
			success: true,
			exercise,
		});
	} catch (err) {
		if (err?.code === 11000) {
			return res.status(409).json({
				success: false,
				message: 'Упражнение уже существует',
			});
		}

		res.status(500).json({
			success: false,
			message: 'Failed to update exercise',
		});
	}
});

router.delete('/:exerciseId', async (req, res) => {
	try {
		const { exerciseId } = req.params;
		if (!exerciseId) {
			return res.status(400).json({
				success: false,
				message: 'Exercise id is required',
			});
		}
		if (!mongoose.isValidObjectId(exerciseId)) {
			return res.status(400).json({
				success: false,
				message: 'Invalid exercise id',
			});
		}

		const exercise = await ExerciseUserLibrary.findOne({
			_id: exerciseId,
			userId: req.userId,
		});

		if (!exercise) {
			return res.status(404).json({
				success: false,
				message: 'Exercise not found',
			});
		}

		const [entryUsages, templateUsages] = await Promise.all([
			ExerciseEntry.countDocuments({
				userId: req.userId,
				exerciseUserLibraryId: exerciseId,
			}),
			Template.countDocuments({
				userId: req.userId,
				'exercises.exerciseUserLibraryId': exerciseId,
			}),
		]);

		const cascade = ['1', 'true', 'yes'].includes(
			String(req.query.cascade || '').toLowerCase()
		);

		if ((entryUsages > 0 || templateUsages > 0) && !cascade) {
			return res.status(409).json({
				success: false,
				message: 'Exercise is used in dates/templates. Confirm cascade delete to remove all usages.',
				usage: {
					entries: entryUsages,
					templates: templateUsages,
				},
			});
		}

		let deletedEntries = 0;
		let updatedTemplates = 0;

		if (cascade) {
			const [entryDeleteResult, templateUpdateResult] = await Promise.all([
				ExerciseEntry.deleteMany({
					userId: req.userId,
					exerciseUserLibraryId: exerciseId,
				}),
				Template.updateMany(
					{ userId: req.userId },
					{
						$pull: {
							exercises: { exerciseUserLibraryId: exerciseId },
						},
					}
				),
			]);

			deletedEntries = entryDeleteResult?.deletedCount || 0;
			updatedTemplates = templateUpdateResult?.modifiedCount || 0;
		}

		await ExerciseUserLibrary.deleteOne({
			_id: exerciseId,
			userId: req.userId,
		});

		res.json({
			success: true,
			message: 'Exercise deleted successfully',
			deleted: {
				libraryExercise: 1,
				entries: deletedEntries,
				templates: updatedTemplates,
			},
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete exercise',
		});
	}
});

export default router;
