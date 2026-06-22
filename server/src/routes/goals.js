import express from 'express';
import mongoose from 'mongoose';
import ExerciseEntry from '../models/ExerciseEntry.js';
import ExerciseUserLibrary from '../models/ExerciseUserLibrary.js';
import Goal from '../models/Goal.js';
import { authMiddleware } from '../middleware/auth.js';

const router = express.Router();
router.use(authMiddleware);

const isValidObjectId = (value) => mongoose.isValidObjectId(value);

const normalizeString = (value) => String(value || '').trim();
const parsePositiveNumber = (value) => {
	const numberValue = Number(value);
	return Number.isFinite(numberValue) && numberValue >= 0 ? numberValue : null;
};

const buildGoalProgress = (goal, entries = []) => {
	const targetSets = Number.isFinite(goal.targetSets) && goal.targetSets > 0 ? goal.targetSets : 1;
	const targetReps = Number.isFinite(goal.targetReps) && goal.targetReps > 0 ? goal.targetReps : 0;

	const matchingEntries = entries.filter((entry) => {
		if (!entry || !Array.isArray(entry.weights)) return false;

		if (goal.exerciseUserLibraryId) {
			return (
				entry.exerciseUserLibraryId &&
				String(entry.exerciseUserLibraryId._id) === String(goal.exerciseUserLibraryId)
			);
		}

		const entryName = normalizeString(entry.exerciseUserLibraryId?.name);
		const goalName = normalizeString(goal.exerciseName);
		return entryName && goalName && entryName.toLowerCase() === goalName.toLowerCase();
	});

	let highestWeight = 0;
	let matchedSets = 0;
	let achievedAt = null;
	const matchedSetsByDate = [];

	for (const entry of matchingEntries) {
		const date = entry.trainingDateId?.date || entry.trainingDateId;
		let entryMatchCount = 0;

		for (const weightRecord of entry.weights) {
			if (!Number.isFinite(weightRecord?.weight)) continue;
			const weightValue = Number(weightRecord.weight);
			if (weightValue < goal.targetWeight) continue;

			highestWeight = Math.max(highestWeight, weightValue);

			if (!Array.isArray(weightRecord.sets)) continue;
			const matchingSetCount = weightRecord.sets.filter((rep) => {
				const repsValue = Number(rep);
				if (!Number.isFinite(repsValue) || repsValue < 0) return false;
				return targetReps > 0 ? repsValue >= targetReps : true;
			}).length;

			entryMatchCount += matchingSetCount;
		}

		if (entryMatchCount > 0) {
			matchedSetsByDate.push({ date: new Date(date || Date.now()), count: entryMatchCount });
		}
	}

	matchedSetsByDate.sort((left, right) => left.date - right.date);

	let cumulativeSets = 0;
	for (const item of matchedSetsByDate) {
		cumulativeSets += item.count;
		if (!achievedAt && cumulativeSets >= targetSets) {
			achievedAt = item.date;
			break;
		}
	}

	matchedSets = cumulativeSets;
	const progressPercent = Math.min(100, Math.round((matchedSets / targetSets) * 100));
	const isAchieved = matchedSets >= targetSets;

	return {
		targetSets,
		targetReps,
		matchedSets,
		highestWeight,
		progressPercent,
		isAchieved,
		achievedAt,
	};
};

const buildGoalResponse = (goal, entries) => {
	const progress = buildGoalProgress(goal, entries);
	return {
		_id: goal._id,
		exerciseUserLibraryId: goal.exerciseUserLibraryId || null,
		exerciseName: goal.exerciseName,
		targetWeight: goal.targetWeight,
		targetSets: goal.targetSets,
		targetReps: goal.targetReps,
		notes: goal.notes || '',
		createdAt: goal.createdAt,
		updatedAt: goal.updatedAt,
		progress,
	};
};

const loadUserExerciseEntries = async (userId) =>
	ExerciseEntry.find({ userId })
		.populate('exerciseUserLibraryId', 'name')
		.populate('trainingDateId', 'date')
		.lean();

router.get('/', async (req, res) => {
	try {
		const goals = await Goal.find({ userId: req.userId }).sort({ createdAt: -1 }).lean();
		const entries = await loadUserExerciseEntries(req.userId);

		const mappedGoals = goals.map((goal) => buildGoalResponse(goal, entries));
		res.json({ success: true, goals: mappedGoals });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Failed to load goals' });
	}
});

router.post('/', async (req, res) => {
	try {
		const exerciseName = normalizeString(req.body.exerciseName);
		const rawTargetWeight = parsePositiveNumber(req.body.targetWeight);
		const rawTargetSets = parsePositiveNumber(req.body.targetSets);
		const rawTargetReps = parsePositiveNumber(req.body.targetReps);
		const notes = normalizeString(req.body.notes || '');
		const exerciseUserLibraryId = req.body.exerciseUserLibraryId;

		if (!exerciseName && !exerciseUserLibraryId) {
			return res.status(400).json({ message: 'Exercise name is required' });
		}

		if (!Number.isFinite(rawTargetWeight) || rawTargetWeight <= 0) {
			return res.status(400).json({ message: 'Target weight must be a positive number' });
		}

		const targetSets = Number.isFinite(rawTargetSets) && rawTargetSets > 0 ? rawTargetSets : 1;
		const targetReps = Number.isFinite(rawTargetReps) ? rawTargetReps : 0;

		let finalExerciseName = exerciseName;
		let finalExerciseUserLibraryId = null;

		if (exerciseUserLibraryId && isValidObjectId(exerciseUserLibraryId)) {
			const libraryExercise = await ExerciseUserLibrary.findOne({
				_id: exerciseUserLibraryId,
				userId: req.userId,
			}).lean();

			if (libraryExercise) {
				finalExerciseName = libraryExercise.name;
				finalExerciseUserLibraryId = libraryExercise._id;
			}
		}

		if (!finalExerciseName) {
			return res.status(400).json({ message: 'Exercise name is required' });
		}

		const goal = await Goal.create({
			userId: req.userId,
			exerciseUserLibraryId: finalExerciseUserLibraryId,
			exerciseName: finalExerciseName,
			targetWeight: rawTargetWeight,
			targetSets,
			targetReps,
			notes,
		});

		const entries = await loadUserExerciseEntries(req.userId);
		const mappedGoal = buildGoalResponse(goal.toObject(), entries);

		res.status(201).json({ success: true, goal: mappedGoal });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Failed to create goal' });
	}
});

router.delete('/:goalId', async (req, res) => {
	try {
		const goalId = req.params.goalId;
		if (!isValidObjectId(goalId)) {
			return res.status(400).json({ message: 'Invalid goal id' });
		}

		const deleted = await Goal.findOneAndDelete({ _id: goalId, userId: req.userId });
		if (!deleted) {
			return res.status(404).json({ message: 'Goal not found' });
		}

		res.json({ success: true, message: 'Goal deleted' });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Failed to delete goal' });
	}
});

export default router;
