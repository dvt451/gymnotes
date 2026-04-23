import { useCallback, useEffect, useState } from 'react';
import { getToken } from '../../utils/getToken';
import { handleCreateExercise as createExerciseInLibrary } from './handleCreateExercise';
import {
	buildMuscleGroupList,
	groupExercisesByMuscleGroup,
	normalizeExerciseMuscleGroup,
} from './muscleGroups';
import {
	buildNextMuscleGroups,
	normalizeLibraryExercise,
	sortUserExercises,
} from './exerciseLibraryUtils';

export function useExerciseLibraryManager(BASE_URL) {
	const [userExercises, setUserExercises] = useState([]);
	const [muscleGroups, setMuscleGroups] = useState(buildMuscleGroupList([]));
	const [customMuscleGroups, setCustomMuscleGroups] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [newMuscleGroupName, setNewMuscleGroupName] = useState('');
	const [muscleGroupError, setMuscleGroupError] = useState('');
	const [isCreatingMuscleGroup, setIsCreatingMuscleGroup] = useState(false);
	const [renameMuscleGroupModalVisible, setRenameMuscleGroupModalVisible] = useState(false);
	const [muscleGroupToRename, setMuscleGroupToRename] = useState('');
	const [renameMuscleGroupValue, setRenameMuscleGroupValue] = useState('');
	const [renameMuscleGroupError, setRenameMuscleGroupError] = useState('');
	const [isRenamingMuscleGroup, setIsRenamingMuscleGroup] = useState(false);
	const [deletingExerciseId, setDeletingExerciseId] = useState('');
	const [renamingExerciseId, setRenamingExerciseId] = useState('');
	const [renameModalVisible, setRenameModalVisible] = useState(false);
	const [renameExercise, setRenameExercise] = useState(null);
	const [renameValue, setRenameValue] = useState('');
	const [renameMuscleGroup, setRenameMuscleGroup] = useState('Others');
	const [renameError, setRenameError] = useState('');

	useEffect(() => {
		const loadLibrary = async () => {
			try {
				setIsLoading(true);
				setError('');
				const token = getToken();

				if (!token) {
					setError('Authorization required');
					return;
				}

				const response = await fetch(`${BASE_URL}/api/exercise-library`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const contentType = response.headers.get('content-type') || '';
				const data = contentType.includes('application/json')
					? await response.json()
					: {};

				if (!response.ok) {
					throw new Error(data.message || 'Failed to load exercise library');
				}

				const nextMuscleGroups = buildMuscleGroupList(data?.muscleGroups || []);
				setUserExercises(
					sortUserExercises(
						Array.isArray(data.userExercises) ? data.userExercises : [],
						nextMuscleGroups
					)
				);
				setMuscleGroups(nextMuscleGroups);
				setCustomMuscleGroups(Array.isArray(data.customMuscleGroups) ? data.customMuscleGroups : []);
			} catch (err) {
				setError(err.message || 'Failed to load exercise library');
			} finally {
				setIsLoading(false);
			}
		};

		loadLibrary();
	}, [BASE_URL]);

	const handleCreateExercise = useCallback(async (exerciseName, muscleGroup) => {
		const result = await createExerciseInLibrary({
			BASE_URL,
			exerciseName,
			existingExercises: userExercises,
			muscleGroup,
		});

		if (!result.success) {
			return result;
		}

		if (result.exercise) {
			const normalizedExercise = normalizeLibraryExercise(result.exercise);
			const nextMuscleGroups = buildNextMuscleGroups(muscleGroups, [
				normalizedExercise.muscleGroup,
			]);
			setMuscleGroups(nextMuscleGroups);

			setUserExercises((prev) => {
				const existsById = prev.some(
					(item) =>
						String(item._id || item.id) ===
						String(normalizedExercise._id || normalizedExercise.id)
				);
				if (existsById) return prev;

				return sortUserExercises([...prev, normalizedExercise], nextMuscleGroups);
			});
		}

		if (result.alreadyExists) {
			return { success: false, message: result.message || 'Exercise already exists' };
		}

		return { success: true };
	}, [BASE_URL, muscleGroups, userExercises]);

	const handleCreateMuscleGroup = useCallback(async () => {
		const nextName = newMuscleGroupName.trim();
		if (!nextName) {
			setMuscleGroupError('Enter muscle group name');
			return;
		}

		setIsCreatingMuscleGroup(true);
		setMuscleGroupError('');

		try {
			const token = getToken();
			if (!token) {
				setMuscleGroupError('Authorization required');
				return;
			}

			const response = await fetch(`${BASE_URL}/api/exercise-library/muscle-groups`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name: nextName }),
			});

			const data = (response.headers.get('content-type') || '').includes('application/json')
				? await response.json()
				: {};

			if (!response.ok) {
				setMuscleGroupError(data?.message || 'Failed to create muscle group');
				return;
			}

			setMuscleGroups(buildMuscleGroupList(data?.muscleGroups || [data?.muscleGroup]));
			setCustomMuscleGroups(
				Array.isArray(data?.customMuscleGroups) ? data.customMuscleGroups : customMuscleGroups
			);
			setNewMuscleGroupName('');
		} catch (err) {
			setMuscleGroupError(err.message || 'Failed to create muscle group');
		} finally {
			setIsCreatingMuscleGroup(false);
		}
	}, [BASE_URL, customMuscleGroups, newMuscleGroupName]);

	const openRenameMuscleGroupModal = useCallback((groupName) => {
		setMuscleGroupToRename(groupName);
		setRenameMuscleGroupValue(groupName);
		setRenameMuscleGroupError('');
		setRenameMuscleGroupModalVisible(true);
	}, []);

	const closeRenameMuscleGroupModal = useCallback(() => {
		setRenameMuscleGroupModalVisible(false);
		setMuscleGroupToRename('');
		setRenameMuscleGroupValue('');
		setRenameMuscleGroupError('');
	}, []);

	const handleRenameMuscleGroup = useCallback(async () => {
		const currentName = muscleGroupToRename.trim();
		const nextName = renameMuscleGroupValue.trim();
		if (!currentName || !nextName) return;

		setIsRenamingMuscleGroup(true);
		setRenameMuscleGroupError('');

		try {
			const token = getToken();
			if (!token) {
				setRenameMuscleGroupError('Authorization required');
				return;
			}

			const response = await fetch(
				`${BASE_URL}/api/exercise-library/muscle-groups/${encodeURIComponent(currentName)}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ name: nextName }),
				}
			);

			const data = (response.headers.get('content-type') || '').includes('application/json')
				? await response.json()
				: {};

			if (!response.ok) {
				setRenameMuscleGroupError(data?.message || 'Failed to rename muscle group');
				return;
			}

			const nextGroupName = data?.muscleGroup || nextName;
			const nextMuscleGroups = buildMuscleGroupList(data?.muscleGroups || [nextGroupName]);
			setMuscleGroups(nextMuscleGroups);
			setCustomMuscleGroups(
				Array.isArray(data?.customMuscleGroups) ? data.customMuscleGroups : customMuscleGroups
			);
			setUserExercises((prev) =>
				sortUserExercises(
					prev.map((item) =>
						normalizeExerciseMuscleGroup(item.muscleGroup, nextMuscleGroups).toLowerCase() ===
							currentName.toLowerCase()
							? { ...item, muscleGroup: nextGroupName }
							: item
					),
					nextMuscleGroups
				)
			);

			closeRenameMuscleGroupModal();
		} catch (err) {
			setRenameMuscleGroupError(err.message || 'Failed to rename muscle group');
		} finally {
			setIsRenamingMuscleGroup(false);
		}
	}, [
		BASE_URL,
		closeRenameMuscleGroupModal,
		customMuscleGroups,
		muscleGroupToRename,
		renameMuscleGroupValue,
	]);

	const handleDeleteExercise = useCallback(async (exercise) => {
		const exerciseId = exercise?._id || exercise?.id;
		if (!exerciseId) return;

		const shouldDelete = window.confirm(
			`Delete "${exercise.name}" from the global library?`
		);
		if (!shouldDelete) return;

		setDeletingExerciseId(String(exerciseId));
		setError('');

		try {
			const token = getToken();
			if (!token) {
				setError('Authorization required');
				return;
			}

			const sendDelete = async (cascade = false) => {
				const query = cascade ? '?cascade=true' : '';
				return fetch(`${BASE_URL}/api/exercise-library/${exerciseId}${query}`, {
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
			};

			let response = await sendDelete(false);
			let data = {};
			if ((response.headers.get('content-type') || '').includes('application/json')) {
				data = await response.json();
			}

			if (response.status === 409) {
				const usage = data?.usage || {};
				const shouldCascade = window.confirm(
					`This exercise is used in dates (${usage.entries || 0}) and templates (${usage.templates || 0}). Delete it everywhere?`
				);
				if (!shouldCascade) return;

				response = await sendDelete(true);
				data = {};
				if ((response.headers.get('content-type') || '').includes('application/json')) {
					data = await response.json();
				}
			}

			if (!response.ok) {
				throw new Error(data?.message || 'Failed to delete exercise');
			}

			setUserExercises((prev) =>
				prev.filter((item) => String(item._id || item.id) !== String(exerciseId))
			);
		} catch (err) {
			setError(err.message || 'Failed to delete exercise');
		} finally {
			setDeletingExerciseId('');
		}
	}, [BASE_URL]);

	const openRenameModal = useCallback((exercise) => {
		setRenameExercise(exercise);
		setRenameValue(exercise?.name || '');
		setRenameMuscleGroup(normalizeExerciseMuscleGroup(exercise?.muscleGroup));
		setRenameError('');
		setRenameModalVisible(true);
	}, []);

	const closeRenameModal = useCallback(() => {
		setRenameModalVisible(false);
		setRenameExercise(null);
		setRenameValue('');
		setRenameMuscleGroup('Others');
		setRenameError('');
	}, []);

	const handleRenameExercise = useCallback(async () => {
		const exerciseId = renameExercise?._id || renameExercise?.id;
		const nextName = renameValue.trim();
		if (!exerciseId || !nextName) return;

		setRenamingExerciseId(String(exerciseId));
		setRenameError('');

		try {
			const token = getToken();
			if (!token) {
				setRenameError('Authorization required');
				return;
			}

			const response = await fetch(`${BASE_URL}/api/exercise-library/${exerciseId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: nextName,
					muscleGroup: renameMuscleGroup,
				}),
			});

			const data = (response.headers.get('content-type') || '').includes('application/json')
				? await response.json()
				: {};

			if (!response.ok) {
				setRenameError(data?.message || 'Failed to rename exercise');
				return;
			}

			const updated = normalizeLibraryExercise(data?.exercise || {});
			const nextMuscleGroups = buildNextMuscleGroups(muscleGroups, [
				updated?.muscleGroup,
			]);
			setMuscleGroups(nextMuscleGroups);
			setUserExercises((prev) =>
				sortUserExercises(
					prev.map((item) =>
						String(item._id || item.id) === String(exerciseId)
							? {
								...item,
								name: updated?.name || nextName,
								muscleGroup: updated?.muscleGroup || item.muscleGroup,
							}
							: item
					),
					nextMuscleGroups
				)
			);

			closeRenameModal();
		} catch (err) {
			setRenameError(err.message || 'Failed to rename exercise');
		} finally {
			setRenamingExerciseId('');
		}
	}, [
		BASE_URL,
		closeRenameModal,
		muscleGroups,
		renameExercise,
		renameMuscleGroup,
		renameValue,
	]);

	const allMuscleGroupSections = groupExercisesByMuscleGroup(userExercises, muscleGroups, {
		includeEmpty: true,
	});
	const groupedUserExercises = groupExercisesByMuscleGroup(userExercises, muscleGroups);

	return {
		allMuscleGroupSections,
		closeRenameModal,
		closeRenameMuscleGroupModal,
		customMuscleGroups,
		deletingExerciseId,
		error,
		groupedUserExercises,
		handleCreateExercise,
		handleCreateMuscleGroup,
		handleDeleteExercise,
		handleRenameExercise,
		handleRenameMuscleGroup,
		isCreatingMuscleGroup,
		isLoading,
		isRenamingMuscleGroup,
		muscleGroupError,
		muscleGroups,
		muscleGroupToRename,
		newMuscleGroupName,
		openRenameModal,
		openRenameMuscleGroupModal,
		renameError,
		renameExercise,
		renameModalVisible,
		renameMuscleGroup,
		renameMuscleGroupError,
		renameMuscleGroupModalVisible,
		renameMuscleGroupValue,
		renameValue,
		renamingExerciseId,
		setMuscleGroupError,
		setNewMuscleGroupName,
		setRenameMuscleGroup,
		setRenameMuscleGroupValue,
		setRenameValue,
		userExercises,
	};
}
