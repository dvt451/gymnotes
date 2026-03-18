import { getToken } from '../../utils/getToken';

export const normalizeExerciseName = (value = '') =>
	value
		.trim()
		.replace(/\s+/g, ' ');

export const findExactExerciseMatch = (existingExercises = [], inputName = '') => {
	const normalized = normalizeExerciseName(inputName).toLowerCase();
	if (!normalized) return null;

	return (
		existingExercises.find(
			(item) => (item?.name || '').trim().toLowerCase() === normalized
		) || null
	);
};

export const filterExercisesByName = (existingExercises = [], inputName = '') => {
	const normalized = normalizeExerciseName(inputName).toLowerCase();
	if (!normalized) return existingExercises;

	return existingExercises.filter((item) =>
		(item?.name || '').toLowerCase().includes(normalized)
	);
};

export const handleCreateExercise = async ({
	BASE_URL,
	exerciseName,
	existingExercises = [],
	muscleGroup,
}) => {
	const normalized = normalizeExerciseName(exerciseName);
	if (!normalized) {
		return { success: false, message: 'Enter exercise name' };
	}

	const exactMatch = findExactExerciseMatch(existingExercises, normalized);
	if (exactMatch) {
		return {
			success: true,
			alreadyExists: true,
			created: false,
			exercise: exactMatch,
			message: 'Exercise already exists',
		};
	}

	try {
		const token = getToken();
		if (!token) {
			return { success: false, message: 'Authorization required' };
		}

		const response = await fetch(`${BASE_URL}/api/exercise-library`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${token}`,
			},
			body: JSON.stringify({
				name: normalized,
				...(muscleGroup ? { muscleGroup } : {}),
			}),
		});

		const contentType = response.headers.get('content-type') || '';
		const data = contentType.includes('application/json')
			? await response.json()
			: {};

		if (!response.ok) {
			if (response.status === 409) {
				return {
					success: true,
					alreadyExists: true,
					created: false,
					exercise: data?.existingExercise || null,
					message: data?.message || 'Exercise already exists',
				};
			}

			return {
				success: false,
				message: data?.message || 'Failed to create exercise',
			};
		}

		return {
			success: true,
			alreadyExists: false,
			created: true,
			exercise: data?.exercise || null,
		};
	} catch (err) {
		return {
			success: false,
			message: err.message || 'Failed to create exercise',
		};
	}
};
