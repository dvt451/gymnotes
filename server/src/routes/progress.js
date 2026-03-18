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

const getMaxWeight = (weights = []) =>
  weights.reduce((max, item) => {
    const nextWeight = Number(item?.weight);
    if (!Number.isFinite(nextWeight) || nextWeight < 0) return max;
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

router.use(authMiddleware);

router.get('/', async (req, res) => {
  try {
    const trainingDates = await TrainingDate.find({ userId: req.userId })
      .sort({ date: 1, createdAt: 1 })
      .select('_id date trainingFileId')
      .lean();

    const periodFirstDate = trainingDates[0]?.date || null;
    const periodLastDate = trainingDates[trainingDates.length - 1]?.date || null;
    const trainingFileIds = new Set(
      trainingDates
        .map((item) => item?.trainingFileId?.toString())
        .filter(Boolean)
    );

    const trainingDateMap = new Map(
      trainingDates.map((item) => [item._id.toString(), item.date])
    );

    const exerciseEntries = await ExerciseEntry.find({ userId: req.userId })
      .select('exerciseUserLibraryId trainingDateId weights')
      .lean();

    const libraryIds = [
      ...new Set(
        exerciseEntries
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

    for (const entry of exerciseEntries) {
      const exerciseId = entry?.exerciseUserLibraryId?.toString();
      const trainingDateId = entry?.trainingDateId?.toString();
      const entryDate = trainingDateMap.get(trainingDateId);

      if (!exerciseId || !entryDate) continue;

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
