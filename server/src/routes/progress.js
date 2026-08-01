import express from 'express';
import TrainingDate from '../models/TrainingDate.js';
import ExerciseEntry from '../models/ExerciseEntry.js';
import ExerciseUserLibrary, {
	DEFAULT_MUSCLE_GROUP,
	normalizeMuscleGroup,
} from '../models/ExerciseUserLibrary.js';
import UserMuscleGroup from '../models/UserMuscleGroup.js';
import { authMiddleware } from '../middleware/auth.js';
import { buildMuscleGroupList } from '../utils/muscleGroups.js';

const router = express.Router();

const roundValue = (value) => Math.round((value + Number.EPSILON) * 100) / 100;

const getValidWeights = (weights = []) =>
	Array.isArray(weights)
		? weights.filter((item) => {
			const nextWeight = Number(item?.weight);
			return Number.isFinite(nextWeight) && nextWeight >= 0;
		})
		: [];

const getMaxWeight = (weights = []) =>
	getValidWeights(weights).reduce((max, item) => {
		const nextWeight = Number(item?.weight);
		return Math.max(max, nextWeight);
	}, 0);

const calculateProgressPercent = (startingWeight, currentWeight) => {
	if (startingWeight <= 0) {
		return currentWeight > 0 ? null : 0;
	}

	return roundValue(((currentWeight - startingWeight) / startingWeight) * 100);
};

const createEmptySummary = () => ({
	startingWeight: 0,
	currentWeight: 0,
	addedWeight: 0,
	progressPercent: 0,
	exercisesTracked: 0,
});

const finalizeSummary = (summary) => {
	const startingWeight = roundValue(summary.startingWeight);
	const currentWeight = roundValue(summary.currentWeight);
	const addedWeight = roundValue(currentWeight - startingWeight);

	return {
		startingWeight,
		currentWeight,
		addedWeight,
		progressPercent: calculateProgressPercent(startingWeight, currentWeight),
		exercisesTracked: summary.exercisesTracked,
	};
};

const getCalendarDays = (firstDate, lastDate) => {
	if (!firstDate || !lastDate) return 0;

	const start = new Date(firstDate);
	const end = new Date(lastDate);
	start.setHours(0, 0, 0, 0);
	end.setHours(0, 0, 0, 0);

	return Math.floor((end.getTime() - start.getTime()) / 86400000) + 1;
};

const normalizeDateValue = (value) => {
	if (!value) return '';
	if (value instanceof Date) {
		return value.toISOString().slice(0, 10);
	}

	const dateString = String(value).trim();
	if (!dateString) return '';

	const [year, month, day] = dateString.split('-').map((part) => Number(part));
	if (!year || !month || !day) return '';

	const normalized = new Date(Date.UTC(year, month - 1, day));
	return normalized.toISOString().slice(0, 10);
};

const isDateWithinRange = (value, startDate, endDate) => {
	if (!value) return false;

	const candidateDate = normalizeDateValue(value);
	if (!candidateDate) return false;

	if (startDate && candidateDate < startDate) return false;
	if (endDate && candidateDate > endDate) return false;

	return true;
};

router.use(authMiddleware);

router.get('/', async (req, res) => {
	try {
		const startDate = normalizeDateValue(req.query.startDate);
		const endDate = normalizeDateValue(req.query.endDate);

		const allTrainingDates = await TrainingDate.find({ userId: req.userId })
			.sort({ date: 1, createdAt: 1 })
			.select('_id date trainingFileId')
			.lean();

		const filteredTrainingDates = allTrainingDates.filter((item) =>
			isDateWithinRange(item?.date, startDate, endDate)
		);

		const trainingDateMap = new Map(
			filteredTrainingDates.map((item) => [item._id.toString(), item])
		);
		const relevantTrainingDateIds = filteredTrainingDates.map((item) => item._id);

		const exerciseEntries = relevantTrainingDateIds.length
			? await ExerciseEntry.find({
				userId: req.userId,
				trainingDateId: { $in: relevantTrainingDateIds },
			})
				.select('exerciseUserLibraryId trainingDateId weights')
				.lean()
			: [];

		const weightedExerciseEntries = exerciseEntries.filter(
			(entry) => getValidWeights(entry?.weights).length > 0
		);

		const libraryIds = [
			...new Set(
				weightedExerciseEntries
					.map((entry) => entry?.exerciseUserLibraryId?.toString())
					.filter(Boolean)
			),
		];

		const libraryExercises = libraryIds.length
			? await ExerciseUserLibrary.find({
				userId: req.userId,
				_id: { $in: libraryIds },
			})
				.select('_id name muscleGroup')
				.lean()
			: [];

		const libraryMap = new Map(
			libraryExercises.map((item) => [item._id.toString(), item])
		);

		const customGroups = await UserMuscleGroup.find({ userId: req.userId })
			.sort({ name: 1 })
			.select('name')
			.lean();
		const allMuscleGroups = buildMuscleGroupList(customGroups.map((item) => item.name));

		const exerciseProgressMap = new Map();
		const weightedTrainingDateIds = new Set();

		for (const entry of weightedExerciseEntries) {
			const exerciseId = entry?.exerciseUserLibraryId?.toString();
			const trainingDateId = entry?.trainingDateId?.toString();
			const trainingDate = trainingDateMap.get(trainingDateId);
			const entryDate = trainingDate?.date;

			if (!exerciseId || !entryDate) continue;

			weightedTrainingDateIds.add(trainingDateId);

			const libraryExercise = libraryMap.get(exerciseId);
			const entryWeight = getMaxWeight(entry?.weights);
			const muscleGroup = normalizeMuscleGroup(
				libraryExercise?.muscleGroup,
				allMuscleGroups
			);

			const existingExercise = exerciseProgressMap.get(exerciseId);
			const nextExercise = existingExercise || {
				exerciseId,
				name: libraryExercise?.name || 'Unknown Exercise',
				muscleGroup: muscleGroup || DEFAULT_MUSCLE_GROUP,
				firstDate: entryDate,
				lastDate: entryDate,
				startingWeight: entryWeight,
				currentWeight: entryWeight,
			};

			if (entryDate < nextExercise.firstDate) {
				nextExercise.firstDate = entryDate;
				nextExercise.startingWeight = entryWeight;
			}

			if (entryDate > nextExercise.lastDate) {
				nextExercise.lastDate = entryDate;
				nextExercise.currentWeight = entryWeight;
			}

			exerciseProgressMap.set(exerciseId, nextExercise);
		}

		const trainingDates = filteredTrainingDates.filter((item) =>
			weightedTrainingDateIds.has(item._id.toString())
		);
		const periodFirstDate = trainingDates[0]?.date || null;
		const periodLastDate = trainingDates[trainingDates.length - 1]?.date || null;
		const trainingFileIds = new Set(
			trainingDates
				.map((item) => item?.trainingFileId?.toString())
				.filter(Boolean)
		);

		const exercises = Array.from(exerciseProgressMap.values())
			.map((item) => ({
				...item,
				addedWeight: roundValue(item.currentWeight - item.startingWeight),
				progressPercent: calculateProgressPercent(
					item.startingWeight,
					item.currentWeight
				),
			}))
			.sort((left, right) => left.name.localeCompare(right.name));

		const overallSummary = createEmptySummary();
		const muscleGroupSummaries = new Map(
			allMuscleGroups.map((group) => [group, createEmptySummary()])
		);

		for (const exercise of exercises) {
			overallSummary.startingWeight += exercise.startingWeight;
			overallSummary.currentWeight += exercise.currentWeight;
			overallSummary.exercisesTracked += 1;

			const groupSummary =
				muscleGroupSummaries.get(exercise.muscleGroup) || createEmptySummary();
			groupSummary.startingWeight += exercise.startingWeight;
			groupSummary.currentWeight += exercise.currentWeight;
			groupSummary.exercisesTracked += 1;
			muscleGroupSummaries.set(exercise.muscleGroup, groupSummary);
		}

		res.json({
			success: true,
			period: {
				firstDate: periodFirstDate,
				lastDate: periodLastDate,
				trainingDays: trainingDates.length,
				calendarDays: getCalendarDays(periodFirstDate, periodLastDate),
				trainingFiles: trainingFileIds.size,
				trackedExercises: exercises.length,
			},
			overall: finalizeSummary(overallSummary),
			muscleGroups: allMuscleGroups.map((group) => ({
				muscleGroup: group,
				...finalizeSummary(muscleGroupSummaries.get(group) || createEmptySummary()),
			})),
			exercises,
		});
	} catch (err) {
		res.status(500).json({
			success: false,
			message: 'Failed to load progress statistics',
		});
	}
});

export default router;
