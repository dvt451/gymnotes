import React, { useContext, useEffect, useState } from 'react';
import Popup from '../../widgets/Popup';
import { GlobalContext } from '../../../context/GlobalContext';
import { createExercisesStyles } from './ExersicesStyles';
import { createCommonStyle } from '../../../styles/commonStyle';
import {
	handleCreateExercise,
	filterExercisesByName,
	findExactExerciseMatch,
	normalizeExerciseName,
} from '../exerciseLibrary/handleCreateExercise';
import {
	DEFAULT_MUSCLE_GROUP,
	normalizeExerciseMuscleGroup,
} from '../exerciseLibrary/muscleGroups';
import { createPopupStyle } from '../../widgets/popupStyle';
import axios from 'axios';
import { getToken } from '../../../components/utils/getToken';
import MuscleGroupSelect from '../../widgets/MuscleGroupSelect';

const normalizeExercisePayload = (ex) => ({
	...ex,
	id: ex._id?.toString() || ex.id || `${Date.now()}_${Math.random().toString(36).slice(2)}`,
	comment: typeof ex.comment === 'string' ? ex.comment : '',
	weights: (ex.weights || []).map((w, weightIndex) => ({
		...w,
		id: w._id?.toString() || w.id || `weight_${weightIndex}_${Date.now()}`,
		sets: (w.sets || []).map((s, setIndex) => {
			if (s && typeof s === 'object') {
				return {
					...s,
					id: s._id?.toString() || s.id || `set_${setIndex}_${Date.now()}`,
				};
			}

			return {
				_id: `set_${setIndex}`,
				id: `set_${setIndex}_${Date.now()}`,
				reps: Number(s) || 0,
			};
		}),
	})),
});

export default function AddExercisePopup({
	userExercises,
	BASE_URL,
	trainingId,
	date,
	exercises,
	setExercises,
	modalVisible,
	setModalVisible,
	modalError,
	setModalError,
	setUserExercises,
}) {
	const [newExerciseName, setNewExerciseName] = useState('');
	const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(DEFAULT_MUSCLE_GROUP);
	const [isCreatingExercise, setIsCreatingExercise] = useState(false);

	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const popupStyle = createPopupStyle(mainColor);
	const commonStyle = createCommonStyle(mainColor);

	const mergeExerciseToDayList = (exercisePayload) => {
		const normalized = normalizeExercisePayload(exercisePayload);

		setExercises((prev) => {
			const existingIndex = prev.findIndex(
				(item) => String(item._id || item.id) === String(normalized._id || normalized.id)
			);

			if (existingIndex >= 0) {
				const next = [...prev];
				next[existingIndex] = normalized;
				return next;
			}

			return [...prev, normalized];
		});
	};

	const closeModal = () => {
		setModalVisible(false);
		setNewExerciseName('');
		setSelectedMuscleGroup(DEFAULT_MUSCLE_GROUP);
		setModalError('');
	};

	const isExerciseAlreadyInDay = ({ name, exerciseUserLibraryId }) => {
		const normalizedName = normalizeExerciseName(name).toLowerCase();
		const normalizedLibraryId = exerciseUserLibraryId ? String(exerciseUserLibraryId) : '';

		return exercises.some((item) => {
			const itemLibraryId = item.exerciseUserLibraryId ? String(item.exerciseUserLibraryId) : '';
			if (normalizedLibraryId && itemLibraryId && normalizedLibraryId === itemLibraryId) {
				return true;
			}

			const itemName = normalizeExerciseName(item?.name || '').toLowerCase();
			return Boolean(normalizedName && itemName && itemName === normalizedName);
		});
	};

	const addExerciseToCurrentDay = async ({ name, exerciseUserLibraryId }) => {
		if (isExerciseAlreadyInDay({ name, exerciseUserLibraryId })) {
			return { success: false, message: 'Exercise is already in the list' };
		}

		try {
			const token = await getToken();
			const payload = {
				name,
				...(exerciseUserLibraryId ? { exerciseUserLibraryId } : {}),
			};

			const response = await axios.post(
				`${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises`,
				payload,
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			mergeExerciseToDayList(response.data);
			return { success: true };
		} catch (err) {
			const message =
				err?.response?.data?.message ||
				err.message ||
				'Failed to add exercise to the day';
			return { success: false, message };
		}
	};

	const createExerciseFromModal = async () => {
		const normalizedInput = normalizeExerciseName(newExerciseName);
		if (!normalizedInput) return;

		setIsCreatingExercise(true);
		setModalError('');

		try {
			if (isExerciseAlreadyInDay({ name: normalizedInput })) {
				setModalError('Exercise is already in the list');
				return;
			}

			const createResult = await handleCreateExercise({
				BASE_URL,
				exerciseName: normalizedInput,
				existingExercises: userExercises,
				muscleGroup: selectedMuscleGroup,
			});

			if (!createResult.success) {
				setModalError(createResult.message || 'Failed to create exercise');
				return;
			}

			const matchedExercise =
				createResult.exercise || findExactExerciseMatch(userExercises, normalizedInput);

			if (createResult.exercise) {
				setUserExercises((prev) => {
					const existsById = prev.some(
						(item) =>
							String(item._id || item.id) ===
							String(createResult.exercise._id || createResult.exercise.id)
					);
					if (existsById) return prev;

					return [...prev, createResult.exercise].sort((a, b) =>
						(a.name || '').localeCompare(b.name || '')
					);
				});
			}

			const addResult = await addExerciseToCurrentDay({
				name: matchedExercise?.name || normalizedInput,
				exerciseUserLibraryId: matchedExercise?._id,
			});

			if (!addResult.success) {
				setModalError(addResult.message || 'Failed to add exercise to the day');
				return;
			}

			closeModal();
		} finally {
			setIsCreatingExercise(false);
		}
	};

	const addExistingExerciseFromModal = async (exercise) => {
		if (!exercise || isCreatingExercise) return;

		setIsCreatingExercise(true);
		setModalError('');
		setSelectedMuscleGroup(normalizeExerciseMuscleGroup(exercise.muscleGroup));

		try {
			if (
				isExerciseAlreadyInDay({
					name: exercise.name,
					exerciseUserLibraryId: exercise._id || exercise.id,
				})
			) {
				setModalError('Exercise is already in the list');
				return;
			}

			const addResult = await addExerciseToCurrentDay({
				name: exercise.name,
				exerciseUserLibraryId: exercise._id || exercise.id,
			});

			if (!addResult.success) {
				setModalError(addResult.message || 'Failed to add exercise to the day');
				return;
			}

			closeModal();
		} finally {
			setIsCreatingExercise(false);
		}
	};

	useEffect(() => {
		const loadUserLibrary = async () => {
			try {
				const token = getToken();
				if (!token) return;

				const response = await fetch(`${BASE_URL}/api/exercise-library`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) return;
				const data = await response.json();
				setUserExercises(Array.isArray(data.userExercises) ? data.userExercises : []);
			} catch (err) {
				console.error('Error loading exercise library:', err);
			}
		};

		loadUserLibrary();
	}, [BASE_URL, setUserExercises]);

	const filteredExistingExercises = filterExercisesByName(userExercises, newExerciseName);
	const exactMatch = findExactExerciseMatch(userExercises, newExerciseName);
	const normalizedInput = normalizeExerciseName(newExerciseName);
	const shouldCreateExercise = Boolean(normalizedInput) && !exactMatch;

	return (
		<Popup isOpen={modalVisible} onClose={closeModal}>
			<h2 style={popupStyle.title}>New Exercise</h2>

			<div style={popupStyle.popupBodyContent}>
				<input
					type="text"
					style={popupStyle.popupInput}
					placeholder="Exercise name"
					value={newExerciseName}
					onChange={(e) => {
						setModalError('');
						setNewExerciseName(e.target.value);
					}}
					autoFocus
				/>

				{shouldCreateExercise && (
					<MuscleGroupSelect
						style={popupStyle.popupInput}
						value={selectedMuscleGroup}
						onChange={setSelectedMuscleGroup}
						disabled={isCreatingExercise}
					/>
				)}

				{exactMatch && (
					<p style={{ ...styles.noExercises, margin: '0 0 8px 0', padding: '8px' }}>
						Already in library: {exactMatch.name}
					</p>
				)}

				{modalError && (
					<p style={{ ...styles.error, margin: '0 0 8px 0', padding: '8px' }}>
						{modalError}
					</p>
				)}

				<div style={popupStyle.popupLibraryBlock}>
					<h3 style={popupStyle.title}>Library</h3>
					<div style={popupStyle.libraryList}>
						{userExercises.length === 0 && (
							<span style={{ color: '#c7d1db', fontSize: '14px' }}>Library is empty</span>
						)}
						{userExercises.length > 0 && filteredExistingExercises.length === 0 && (
							<span style={{ color: '#c7d1db', fontSize: '14px' }}>No matches found</span>
						)}
						{filteredExistingExercises.map((item) => (
							<button
								key={item._id || item.id || item.name}
								type="button"
								onClick={() => addExistingExerciseFromModal(item)}
								disabled={isCreatingExercise}
								style={popupStyle.libraryItem}
							>
								{item.name}
							</button>
						))}
					</div>
				</div>
			</div>

			<div style={commonStyle.popupButtons}>
				<button
					style={commonStyle.popupCreateButton}
					onClick={createExerciseFromModal}
					disabled={!newExerciseName.trim() || isCreatingExercise}
				>
					{isCreatingExercise
						? 'Saving...'
						: shouldCreateExercise
							? 'Create Exercise'
							: 'Add Exercise'}
				</button>
				<button
					style={commonStyle.popupCancelButton}
					onClick={closeModal}
					disabled={isCreatingExercise}
				>
					Cancel
				</button>
			</div>
		</Popup>
	);
}
