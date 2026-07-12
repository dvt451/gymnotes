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
const parseNumber = (value, fallback = 0) => {
	const numberValue = Number(value);
	return Number.isFinite(numberValue) ? numberValue : fallback;
};
const parseGoalType = (value) => {
	const goalType = normalizeString(value).toLowerCase();
	return goalType === 'body' || goalType === 'skill' ? goalType : 'exercise';
};

const buildGoalProgress = (goal, entries = []) => {
	const goalType = parseGoalType(goal.goalType);

	if (goalType === 'body') {
		const targetValue = parseNumber(goal.targetValue, 0);
		const currentValue = parseNumber(goal.currentValue, 0);
		const progressPercent = targetValue > 0 ? Math.min(100, Math.round((currentValue / targetValue) * 100)) : 0;
		const isAchieved = targetValue > 0 ? currentValue >= targetValue : false;

		return {
			goalType,
			targetValue,
			currentValue,
			progressPercent,
			isAchieved,
			achievedAt: isAchieved ? goal.updatedAt || new Date() : null,
		};
	}

	if (goalType === 'skill') {
		const isAchieved = Boolean(goal.isCompleted);
		return {
			goalType,
			isAchieved,
			progressPercent: isAchieved ? 100 : 0,
			achievedAt: isAchieved ? goal.updatedAt || new Date() : null,
		};
	}

	const targetWeight = parseNumber(goal.targetWeight, 1);
	const targetSets = parseNumber(goal.targetSets, 1);
	const targetReps = parseNumber(goal.targetReps, 0);
	const normalizedTargetWeight = targetWeight > 0 ? targetWeight : 1;
	const normalizedTargetSets = targetSets > 0 ? targetSets : 1;
	const normalizedTargetReps = targetReps > 0 ? targetReps : 0;

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
	let highestRepAtHighestWeight = 0;
	let achievedAt = null;

	for (const entry of matchingEntries) {
		const date = entry.trainingDateId?.date || entry.trainingDateId;

		for (const weightRecord of entry.weights) {
			if (!Number.isFinite(weightRecord?.weight)) continue;
			const weightValue = Number(weightRecord.weight);
			const repsValuesAtWeight = Array.isArray(weightRecord.sets)
				? weightRecord.sets
					.map((rep) => Number(rep))
					.filter((repsValue) => Number.isFinite(repsValue) && repsValue >= 0)
				: [];
			const highestRepForWeight = repsValuesAtWeight.length > 0 ? Math.max(...repsValuesAtWeight) : 0;

			if (weightValue > highestWeight) {
				highestWeight = weightValue;
				highestRepAtHighestWeight = highestRepForWeight;
			} else if (weightValue === highestWeight) {
				highestRepAtHighestWeight = Math.max(highestRepAtHighestWeight, highestRepForWeight);
			}

			if (!achievedAt && weightValue >= normalizedTargetWeight && normalizedTargetReps > 0 && highestRepForWeight >= normalizedTargetReps) {
				achievedAt = new Date(date || Date.now());
			}
		}
	}

	const currentWeight = highestWeight;
	const weightAchieved = currentWeight >= normalizedTargetWeight;
	const matchedReps = highestRepAtHighestWeight;
	const weightProgressPercent = Math.min(100, Math.round((currentWeight / normalizedTargetWeight) * 100));
	const repsProgressPercent = currentWeight < normalizedTargetWeight
		? 0
		: currentWeight > normalizedTargetWeight
			? 100
			: normalizedTargetReps > 0
				? Math.min(100, Math.round((matchedReps / normalizedTargetReps) * 100))
				: 0;
	const hasReachedTargetReps = normalizedTargetReps > 0 ? matchedReps >= normalizedTargetReps : true;
	const isAchieved = weightAchieved && hasReachedTargetReps;
	const finalAchievedAt = isAchieved && !achievedAt ? goal.updatedAt || new Date() : achievedAt;

	return {
		targetSets: normalizedTargetSets,
		targetReps: normalizedTargetReps,
		matchedReps,
		highestWeight,
		weightProgressPercent,
		repsProgressPercent,
		progressPercent: weightProgressPercent,
		weightAchieved,
		isAchieved,
		achievedAt: finalAchievedAt,
	};
};

const buildGoalResponse = (goal, entries) => {
	const progress = buildGoalProgress(goal, entries);
	return {
		_id: goal._id,
		goalType: parseGoalType(goal.goalType),
		exerciseUserLibraryId: goal.exerciseUserLibraryId || null,
		exerciseName: goal.exerciseName || '',
		bodyPart: goal.bodyPart || '',
		measurementUnit: goal.measurementUnit || '',
		targetWeight: goal.targetWeight ?? null,
		targetValue: goal.targetValue ?? null,
		currentValue: goal.currentValue ?? null,
		targetSets: goal.targetSets,
		targetReps: goal.targetReps,
		isCompleted: Boolean(goal.isCompleted),
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
		const goalType = parseGoalType(req.body.goalType);
		const notes = normalizeString(req.body.notes || '');
		const exerciseName = normalizeString(req.body.exerciseName);
		const exerciseUserLibraryId = req.body.exerciseUserLibraryId;

		if (goalType === 'exercise') {
			const rawTargetWeight = parsePositiveNumber(req.body.targetWeight);
			const rawTargetSets = parsePositiveNumber(req.body.targetSets);
			const rawTargetReps = parsePositiveNumber(req.body.targetReps);

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
				goalType: 'exercise',
				exerciseUserLibraryId: finalExerciseUserLibraryId,
				exerciseName: finalExerciseName,
				targetWeight: rawTargetWeight,
				targetSets,
				targetReps,
				notes,
			});

			const entries = await loadUserExerciseEntries(req.userId);
			const mappedGoal = buildGoalResponse(goal.toObject(), entries);
			return res.status(201).json({ success: true, goal: mappedGoal });
		}

		if (goalType === 'body') {
			const bodyPart = normalizeString(req.body.bodyPart);
			const measurementUnit = normalizeString(req.body.measurementUnit).toLowerCase();
			const targetValue = parsePositiveNumber(req.body.targetValue);
			const currentValue = parseNumber(req.body.currentValue, 0);

			if (!bodyPart) {
				return res.status(400).json({ message: 'Body part is required' });
			}

			if (!['kg', 'cm'].includes(measurementUnit)) {
				return res.status(400).json({ message: 'Measurement type is required' });
			}

			if (!Number.isFinite(targetValue) || targetValue <= 0) {
				return res.status(400).json({ message: 'Target value must be a positive number' });
			}

			const goal = await Goal.create({
				userId: req.userId,
				goalType: 'body',
				exerciseName: bodyPart,
				bodyPart,
				measurementUnit,
				targetValue,
				currentValue,
				notes,
			});

			const entries = await loadUserExerciseEntries(req.userId);
			const mappedGoal = buildGoalResponse(goal.toObject(), entries);
			return res.status(201).json({ success: true, goal: mappedGoal });
		}

		const skillName = normalizeString(req.body.skillName || exerciseName);
		if (!skillName) {
			return res.status(400).json({ message: 'Skill or trick name is required' });
		}

		const goal = await Goal.create({
			userId: req.userId,
			goalType: 'skill',
			exerciseName: skillName,
			isCompleted: Boolean(req.body.isCompleted),
			notes,
		});

		const entries = await loadUserExerciseEntries(req.userId);
		const mappedGoal = buildGoalResponse(goal.toObject(), entries);
		return res.status(201).json({ success: true, goal: mappedGoal });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Failed to create goal' });
	}
});

router.patch('/:goalId', async (req, res) => {
	try {
		const goalId = req.params.goalId;
		if (!isValidObjectId(goalId)) {
			return res.status(400).json({ message: 'Invalid goal id' });
		}

		const goal = await Goal.findOne({ _id: goalId, userId: req.userId });
		if (!goal) {
			return res.status(404).json({ message: 'Goal not found' });
		}

		const goalType = parseGoalType(goal.goalType);
		if (goalType === 'body') {
			const currentValue = parseNumber(req.body.currentValue, null);
			if (currentValue === null) {
				return res.status(400).json({ message: 'Current value is required' });
			}
			goal.currentValue = currentValue;
			await goal.save();
		} else if (goalType === 'skill') {
			goal.isCompleted = Boolean(req.body.isCompleted);
			await goal.save();
		} else {
			return res.status(400).json({ message: 'This goal type cannot be updated here' });
		}

		const entries = await loadUserExerciseEntries(req.userId);
		const updatedGoal = buildGoalResponse(goal.toObject(), entries);
		res.json({ success: true, goal: updatedGoal });
	} catch (err) {
		res.status(500).json({ success: false, message: 'Failed to update goal' });
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
