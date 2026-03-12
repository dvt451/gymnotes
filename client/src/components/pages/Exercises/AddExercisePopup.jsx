import React, { useContext, useEffect, useState } from 'react'
import Popup from '../../widgets/Popup';
import { GlobalContext } from '../../../context/GlobalContext';
import { createExercisesStyles } from './ExersicesStyles';
import { colors, createCommonStyle } from '../../../styles/commonStyle';
import {
	handleCreateExercise,
	filterExercisesByName,
	findExactExerciseMatch,
	normalizeExerciseName,
} from '../exerciseLibrary/handleCreateExercise';
import { createPopupStyle } from '../../widgets/popupStyle';
import axios from 'axios';
import { getToken } from '../../../components/utils/getToken';

const normalizeExercisePayload = (ex) => ({
	...ex,
	id: ex._id?.toString() || ex.id || `${Date.now()}_${Math.random().toString(36).slice(2)}`,
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

const normalizeDateKey = (value) => {
	if (!value) return '';
	const str = String(value);
	return str.includes('T') ? str.split('T')[0] : str;
};

const getPreviousDateKey = (allDates, currentDate) => {
	const current = normalizeDateKey(currentDate);
	if (!current) return '';

	const uniqueSorted = [...new Set(allDates.map(normalizeDateKey).filter(Boolean))].sort(
		(a, b) => new Date(a).getTime() - new Date(b).getTime()
	);

	const prevCandidates = uniqueSorted.filter(
		(dateKey) => new Date(dateKey).getTime() < new Date(current).getTime()
	);

	return prevCandidates.length > 0 ? prevCandidates[prevCandidates.length - 1] : '';
};

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
	setPreviousDateKey,
	setPreviousExercisesByLibraryId
}) {
	const [newExerciseName, setNewExerciseName] = useState('');
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
			return { success: false, message: 'Упражнение уже в списке' };
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
			const message = err?.response?.data?.message || err.message || 'Ошибка добавления упражнения в день';
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
				setModalError('Упражнение уже в списке');
				return;
			}

			const createResult = await handleCreateExercise({
				BASE_URL,
				exerciseName: normalizedInput,
				existingExercises: userExercises,
			});

			if (!createResult.success) {
				setModalError(createResult.message || 'Не удалось создать упражнение');
				return;
			}

			const matchedExercise =
				createResult.exercise || findExactExerciseMatch(userExercises, normalizedInput);

			if (createResult.exercise) {
				setUserExercises((prev) => {
					const existsById = prev.some(
						(item) => String(item._id || item.id) === String(createResult.exercise._id || createResult.exercise.id)
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
				setModalError(addResult.message || 'Не удалось добавить упражнение в день');
				return;
			}

			setModalVisible(false);
			setNewExerciseName('');
			setModalError('');
		} finally {
			setIsCreatingExercise(false);
		}
	};

	const addExistingExerciseFromModal = async (exercise) => {
		if (!exercise || isCreatingExercise) return;

		setIsCreatingExercise(true);
		setModalError('');

		try {
			if (isExerciseAlreadyInDay({ name: exercise.name, exerciseUserLibraryId: exercise._id || exercise.id })) {
				setModalError('Упражнение уже в списке');
				return;
			}

			const addResult = await addExerciseToCurrentDay({
				name: exercise.name,
				exerciseUserLibraryId: exercise._id || exercise.id,
			});

			if (!addResult.success) {
				setModalError(addResult.message || 'Не удалось добавить упражнение в день');
				return;
			}

			setModalVisible(false);
			setNewExerciseName('');
		} finally {
			setIsCreatingExercise(false);
		}
	};
	useEffect(() => {
		const loadExercises = async () => {
			try {
				const token = await getToken();
				const res = await axios.get(
					`${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises`,
					{
						headers: {
							Authorization: `Bearer ${token}`,
						},
					}
				);

				const exercisesArray = res.data.exercises || [];
				setExercises(exercisesArray.map(normalizeExercisePayload));
			} catch (err) {
				console.error('Ошибка при загрузке упражнений:', err);
			}
		};

		loadExercises();
	}, [trainingId, date, BASE_URL]);

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
				console.error('Ошибка загрузки библиотеки упражнений:', err);
			}
		};

		loadUserLibrary();
	}, [BASE_URL]);

	useEffect(() => {
		let isActive = true;

		const loadPreviousDateExercises = async () => {
			try {
				const token = getToken();
				if (!token) {
					if (!isActive) return;
					setPreviousDateKey('');
					setPreviousExercisesByLibraryId({});
					return;
				}

				const headers = {
					Authorization: `Bearer ${token}`,
				};

				const datesResponse = await axios.get(
					`${BASE_URL}/api/trainings/${trainingId}/dates`,
					{ headers }
				);
				const dates = Array.isArray(datesResponse.data) ? datesResponse.data : [];
				const previousDate = getPreviousDateKey(
					dates.map((item) => normalizeDateKey(item?.date)),
					date
				);

				if (!previousDate) {
					if (!isActive) return;
					setPreviousDateKey('');
					setPreviousExercisesByLibraryId({});
					return;
				}

				const exercisesResponse = await axios.get(
					`${BASE_URL}/api/trainings/${trainingId}/dates/${previousDate}/exercises`,
					{ headers }
				);
				const previousExercises = Array.isArray(exercisesResponse.data?.exercises)
					? exercisesResponse.data.exercises
					: [];

				const groupedByLibraryId = previousExercises.reduce((acc, exercise) => {
					const libraryId = String(exercise.exerciseUserLibraryId || '');
					if (!libraryId) return acc;
					acc[libraryId] = Array.isArray(exercise.weights) ? exercise.weights : [];
					return acc;
				}, {});

				if (!isActive) return;
				setPreviousDateKey(previousDate);
				setPreviousExercisesByLibraryId(groupedByLibraryId);
			} catch (err) {
				console.error('Ошибка загрузки предыдущей даты для упражнений:', err);
				if (!isActive) return;
				setPreviousDateKey('');
				setPreviousExercisesByLibraryId({});
			}
		};

		loadPreviousDateExercises();

		return () => {
			isActive = false;
		};
	}, [trainingId, date, BASE_URL]);


	const filteredExistingExercises = filterExercisesByName(userExercises, newExerciseName);
	const exactMatch = findExactExerciseMatch(userExercises, newExerciseName);

	return (
		<Popup isOpen={modalVisible} onClose={() => setModalVisible(false)}>
			<h2 style={popupStyle.title}>New Exercise</h2>

			<div style={popupStyle.popupBodyContent}>
				<input
					type="text"
					style={popupStyle.popupInput}
					placeholder="Название упражнения"
					value={newExerciseName}
					onChange={(e) => {
						setModalError('');
						setNewExerciseName(e.target.value);
					}}
					autoFocus
				/>
				{exactMatch && (
					<p style={{ ...styles.noExercises, margin: '0 0 8px 0', padding: '8px' }}>
						Уже есть в библиотеке: {exactMatch.name}
					</p>
				)}

				{modalError && (
					<p style={{ ...styles.error, margin: '0 0 8px 0', padding: '8px' }}>{modalError}</p>
				)}

				<div style={popupStyle.popupLibraryBlock}>
					<h3 style={popupStyle.title}>Library</h3>
					<div style={popupStyle.libraryList}>
						{userExercises.length === 0 && (
							<span style={{ color: '#c7d1db', fontSize: '14px' }}>Библиотека пользователя пуста</span>
						)}
						{userExercises.length > 0 && filteredExistingExercises.length === 0 && (
							<span style={{ color: '#c7d1db', fontSize: '14px' }}>Совпадений не найдено</span>
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
					{isCreatingExercise ? 'Сохранение...' : 'Сохранить'}
				</button>
				<button
					style={commonStyle.popupCancelButton}
					onClick={() => setModalVisible(false)}
					disabled={isCreatingExercise}
				>
					Отмена
				</button>
			</div>
		</Popup>
	)
}
