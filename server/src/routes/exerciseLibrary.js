import express from 'express';
import mongoose from 'mongoose';
import ExerciseUserLibrary, {
	DEFAULT_MUSCLE_GROUP,
	normalizeMuscleGroup,
} from '../models/ExerciseUserLibrary.js';
import UserMuscleGroup from '../models/UserMuscleGroup.js';
import ExerciseEntry from '../models/ExerciseEntry.js';
import Template from '../models/Template.js';
import { authMiddleware } from '../middleware/auth.js';
import {
	buildMuscleGroupList,
	DEFAULT_MUSCLE_GROUPS,
} from '../utils/muscleGroups.js';

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
const getUserMuscleGroups = async (userId) => {
	const customGroups = await UserMuscleGroup.find({ userId }).sort({ name: 1 }).select('name').lean();
	return buildMuscleGroupList(customGroups.map((item) => item.name));
};

const getCustomMuscleGroups = async (userId) => {
	const customGroups = await UserMuscleGroup.find({ userId }).sort({ name: 1 }).select('name').lean();
	return customGroups.map((item) => item.name);
};

const ensureUserMuscleGroup = async (userId, rawGroupName) => {
	const normalizedGroup = normalizeMuscleGroup(rawGroupName);

	if (!normalizedGroup) {
		return DEFAULT_MUSCLE_GROUP;
	}

	if (
		DEFAULT_MUSCLE_GROUPS.some(
			(group) => group.toLowerCase() === normalizedGroup.toLowerCase()
		)
	) {
		return normalizeMuscleGroup(normalizedGroup, DEFAULT_MUSCLE_GROUPS);
	}

	const existing = await UserMuscleGroup.findOne({
		userId,
		name: { $regex: `^${escapeRegex(normalizedGroup)}$`, $options: 'i' },
	});

	if (existing) {
		return existing.name;
	}

	try {
		const created = await UserMuscleGroup.create({
			userId,
			name: normalizedGroup,
		});

		return created.name;
	} catch (err) {
		if (err?.code === 11000) {
			const duplicate = await UserMuscleGroup.findOne({
				userId,
				name: { $regex: `^${escapeRegex(normalizedGroup)}$`, $options: 'i' },
			});

			return duplicate?.name || normalizedGroup;
		}

		throw err;
	}
};

const mapExerciseWithMuscleGroup = (exercise) => ({
	...exercise.toObject(),
	muscleGroup: normalizeMuscleGroup(exercise?.muscleGroup),
});

router.get('/', async (req, res) => {
	try {
		const [userExercises, muscleGroups] = await Promise.all([
			ExerciseUserLibrary.find({ userId: req.userId })
				.sort({ name: 1, createdAt: 1 })
				.select('_id name muscleGroup createdAt updatedAt'),
			getUserMuscleGroups(req.userId),
		]);
		const customMuscleGroups = await getCustomMuscleGroups(req.userId);

		res.json({
			appExercises: APP_LIBRARY,
			userExercises: userExercises.map(mapExerciseWithMuscleGroup),
			muscleGroups,
			customMuscleGroups,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Failed to load exercise library',
		});
	}
});

router.get('/muscle-groups', async (req, res) => {
	try {
		const [muscleGroups, customMuscleGroups] = await Promise.all([
			getUserMuscleGroups(req.userId),
			getCustomMuscleGroups(req.userId),
		]);
		res.json({ success: true, muscleGroups, customMuscleGroups });
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Failed to load muscle groups',
		});
	}
});

router.post('/muscle-groups', async (req, res) => {
	try {
		const rawName = req.body?.name;
		if (!rawName || typeof rawName !== 'string' || !rawName.trim()) {
			return res.status(400).json({
				success: false,
				message: 'Muscle group name is required',
			});
		}

		const muscleGroup = await ensureUserMuscleGroup(req.userId, rawName);
		const [muscleGroups, customMuscleGroups] = await Promise.all([
			getUserMuscleGroups(req.userId),
			getCustomMuscleGroups(req.userId),
		]);

		res.status(201).json({
			success: true,
			muscleGroup,
			muscleGroups,
			customMuscleGroups,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Failed to create muscle group',
		});
	}
});

router.put('/muscle-groups/:groupName', async (req, res) => {
	try {
		const currentGroupName = decodeURIComponent(req.params.groupName || '').trim();
		const nextGroupName = req.body?.name;

		if (!currentGroupName) {
			return res.status(400).json({
				success: false,
				message: 'Current muscle group is required',
			});
		}

		if (!nextGroupName || typeof nextGroupName !== 'string' || !nextGroupName.trim()) {
			return res.status(400).json({
				success: false,
				message: 'New muscle group name is required',
			});
		}

		const currentGroup = await UserMuscleGroup.findOne({
			userId: req.userId,
			name: { $regex: `^${escapeRegex(currentGroupName)}$`, $options: 'i' },
		});

		if (!currentGroup) {
			return res.status(404).json({
				success: false,
				message: 'Only custom muscle groups can be renamed',
			});
		}

		const targetGroupName = await ensureUserMuscleGroup(req.userId, nextGroupName);

		if (currentGroup.name.toLowerCase() !== targetGroupName.toLowerCase()) {
			await ExerciseUserLibrary.updateMany(
				{
					userId: req.userId,
					muscleGroup: { $regex: `^${escapeRegex(currentGroup.name)}$`, $options: 'i' },
				},
				{ $set: { muscleGroup: targetGroupName } }
			);
		}

		if (currentGroup.name.toLowerCase() === targetGroupName.toLowerCase()) {
			currentGroup.name = targetGroupName;
			await currentGroup.save();
		} else {
			await UserMuscleGroup.deleteOne({ _id: currentGroup._id, userId: req.userId });
		}

		const [muscleGroups, customMuscleGroups] = await Promise.all([
			getUserMuscleGroups(req.userId),
			getCustomMuscleGroups(req.userId),
		]);

		res.json({
			success: true,
			muscleGroup: targetGroupName,
			muscleGroups,
			customMuscleGroups,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Failed to rename muscle group',
		});
	}
});

router.post('/', async (req, res) => {
	try {
		const rawName = req.body?.name;
		const rawMuscleGroup = await ensureUserMuscleGroup(req.userId, req.body?.muscleGroup);
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
				message: 'Exercise already exists',
				existingExercise: mapExerciseWithMuscleGroup(duplicate),
			});
		}

		const created = await ExerciseUserLibrary.create({
			userId: req.userId,
			name: normalizedName,
			muscleGroup: rawMuscleGroup,
		});

		res.status(201).json({
			success: true,
			exercise: mapExerciseWithMuscleGroup(created),
		});
	} catch (err) {
		if (err?.code === 11000) {
			return res.status(409).json({
				success: false,
				message: 'Exercise already exists',
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
		const rawMuscleGroup =
			req.body?.muscleGroup !== undefined
				? await ensureUserMuscleGroup(req.userId, req.body?.muscleGroup)
				: undefined;

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
				message: 'Exercise already exists',
				existingExercise: mapExerciseWithMuscleGroup(duplicate),
			});
		}

		exercise.name = normalizedName;
		if (rawMuscleGroup !== undefined) {
			exercise.muscleGroup = rawMuscleGroup;
		} else if (!exercise.muscleGroup) {
			exercise.muscleGroup = DEFAULT_MUSCLE_GROUP;
		}
		await exercise.save();

		res.json({
			success: true,
			exercise: mapExerciseWithMuscleGroup(exercise),
		});
	} catch (err) {
		if (err?.code === 11000) {
			return res.status(409).json({
				success: false,
				message: 'Exercise already exists',
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
