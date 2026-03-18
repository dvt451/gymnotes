export const DEFAULT_MUSCLE_GROUPS = [
	'Shoulders',
	'Chest',
	'Triceps',
	'Biceps',
	'Back',
	'Legs',
	'Others',
];

export const DEFAULT_MUSCLE_GROUP = 'Others';
export const isDefaultMuscleGroup = (value) =>
	DEFAULT_MUSCLE_GROUPS.some(
		(group) => group.toLowerCase() === sanitizeMuscleGroupName(value).toLowerCase()
	);

export const sanitizeMuscleGroupName = (value) => {
	if (typeof value !== 'string') return DEFAULT_MUSCLE_GROUP;

	const normalized = value.trim().replace(/\s+/g, ' ');
	return normalized || DEFAULT_MUSCLE_GROUP;
};

export const buildMuscleGroupList = (groups = []) => {
	const used = new Set();
	const defaults = [...DEFAULT_MUSCLE_GROUPS];
	const defaultsWithoutOthers = defaults.filter(
		(group) => group.toLowerCase() !== DEFAULT_MUSCLE_GROUP.toLowerCase()
	);
	const customGroups = groups
		.map(sanitizeMuscleGroupName)
		.filter((group) => !defaults.some((item) => item.toLowerCase() === group.toLowerCase()))
		.sort((left, right) => left.localeCompare(right));

	return [...defaultsWithoutOthers, ...customGroups, DEFAULT_MUSCLE_GROUP].filter((group) => {
		const key = group.toLowerCase();
		if (used.has(key)) return false;
		used.add(key);
		return true;
	});
};

export const normalizeExerciseMuscleGroup = (value, availableGroups = []) => {
	const normalized = sanitizeMuscleGroupName(value);
	const groups = buildMuscleGroupList(availableGroups);
	const matched = groups.find((group) => group.toLowerCase() === normalized.toLowerCase());

	return matched || normalized;
};

export const sortExercisesByMuscleGroup = (a, b, availableGroups = []) => {
	const groups = buildMuscleGroupList(availableGroups);
	const groupOrderA = groups.indexOf(
		normalizeExerciseMuscleGroup(a?.muscleGroup, groups)
	);
	const groupOrderB = groups.indexOf(
		normalizeExerciseMuscleGroup(b?.muscleGroup, groups)
	);

	if (groupOrderA !== groupOrderB) {
		return groupOrderA - groupOrderB;
	}

	return (a?.name || '').localeCompare(b?.name || '');
};

export const groupExercisesByMuscleGroup = (
	exercises = [],
	availableGroups = [],
	{ includeEmpty = false } = {}
) => {
	const groups = buildMuscleGroupList([
		...availableGroups,
		...exercises.map((exercise) => exercise?.muscleGroup),
	]);

	return groups
		.map((group) => ({
			group,
			exercises: exercises.filter(
				(exercise) =>
					normalizeExerciseMuscleGroup(exercise?.muscleGroup, groups) === group
			),
		}))
		.filter((item) => includeEmpty || item.exercises.length > 0);
};
