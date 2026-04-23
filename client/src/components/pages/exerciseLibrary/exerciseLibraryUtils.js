import {
	buildMuscleGroupList,
	normalizeExerciseMuscleGroup,
	sortExercisesByMuscleGroup,
} from './muscleGroups';

export const normalizeLibraryExercise = (exercise) => ({
	...exercise,
	muscleGroup: normalizeExerciseMuscleGroup(exercise?.muscleGroup),
});

export const sortUserExercises = (exercises = [], muscleGroups = []) =>
	[...exercises]
		.map((exercise) => ({
			...normalizeLibraryExercise(exercise),
			muscleGroup: normalizeExerciseMuscleGroup(exercise?.muscleGroup, muscleGroups),
		}))
		.sort((a, b) => sortExercisesByMuscleGroup(a, b, muscleGroups));

export const buildNextMuscleGroups = (muscleGroups = [], nextValues = []) =>
	buildMuscleGroupList([
		...muscleGroups,
		...nextValues.filter(Boolean),
	]);
