import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ExerciseItem from './ExerciseItem/ExerciseItem';
import Templates from './Templates/Templates';
import { getToken } from '../../../components/utils/getToken';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { createExercisesStyles } from './ExersicesStyles';
import Header from '../../widgets/Header';
import { colors, createCommonStyle } from '../../../styles/commonStyle';
import { GlobalContext } from '../../../context/GlobalContext';
import {
	handleCreateExercise,
	filterExercisesByName,
	findExactExerciseMatch,
	normalizeExerciseName,
} from '../exerciseLibrary/handleCreateExercise';

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

export default function Exercises() {
	const { trainingId, date } = useParams();
	const location = useLocation();
	const { trainingText, trainingTitle } = location.state || {};
	const [expandedExerciseId, setExpandedExerciseId] = useState(null);
	const { BASE_URL } = useContext(AuthContext);
	const [editState, setEditState] = useState(false);
	const [exercises, setExercises] = useState([]);
	const [userExercises, setUserExercises] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [newExerciseName, setNewExerciseName] = useState('');
	const [modalError, setModalError] = useState('');
	const [isCreatingExercise, setIsCreatingExercise] = useState(false);
	const [previousDateKey, setPreviousDateKey] = useState('');
	const [previousExercisesByLibraryId, setPreviousExercisesByLibraryId] = useState({});
	const { mainColor } = useContext(GlobalContext);

	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);

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

	const addExerciseToCurrentDay = async ({ name, exerciseUserLibraryId }) => {
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

	const openCreateModal = () => {
		setModalError('');
		setModalVisible(true);
	};

	const filteredExistingExercises = filterExercisesByName(userExercises, newExerciseName);
	const exactMatch = findExactExerciseMatch(userExercises, newExerciseName);
	const today = new Date().toISOString().split('T')[0];

	return (
		<>
			<Header />
			<div style={styles.container}>
				<div style={styles.header}>
					<h1 style={styles.title}>
						{trainingText ? `${trainingText} — ` : ''}
						{trainingTitle}
					</h1>
					<p style={styles.date}>{date === today ? 'Today' : date}</p>
				</div>

				<Templates
					setExercises={setExercises}
					trainingId={trainingId}
					date={date}
					BASE_URL={BASE_URL}
					styles={styles}
				/>
				<div style={commonStyle.titleHeader}>
					<h2 style={commonStyle.title}>Exercises</h2>
					<button style={commonStyle.EditButton} onClick={() => setEditState(!editState)}>
						<span
							style={{
								...commonStyle.EditButtonText,
								...{ color: editState && colors.orange, opacity: editState ? 1 : 0.25 },
							}}
						>
							{editState ? 'Editing...' : 'Edit...'}
						</span>
						{editState ? <img src="/img/icons/editorange.png" alt="icon" /> : <img src="/img/icons/edit.png" alt="icon" />}
					</button>
				</div>
				{exercises.length === 0 && (
					<p style={styles.noExercises}>Нет упражнений. Добавьте новое ниже.</p>
				)}

				<div style={styles.list}>
					{Array.isArray(exercises) ? (
						exercises.map((item, index) => (
							<ExerciseItem
								key={item._id?.toString() || `index-${index}`}
								item={item}
								exercises={exercises}
								setExercises={setExercises}
								date={date}
								trainingId={trainingId}
								BASE_URL={BASE_URL}
								expandedExerciseId={expandedExerciseId}
								setExpandedExerciseId={setExpandedExerciseId}
								editState={editState}
								prevWeights={previousExercisesByLibraryId[String(item.exerciseUserLibraryId || '')] || []}
								previousDate={previousDateKey}
							/>
						))
					) : (
						<p style={styles.error}>Невозможно отобразить упражнения</p>
					)}
				</div>

				<button style={styles.addButton} onClick={openCreateModal}>
					<span>+</span>
					<span>Add Exercise</span>
				</button>

				{modalVisible && (
					<div style={commonStyle.popup} onClick={() => setModalVisible(false)}>
						<div style={commonStyle.popupLayer} />
						<div style={commonStyle.popupContent} onClick={(e) => e.stopPropagation()}>
							<div style={commonStyle.popupContentLayer} />
							<div style={commonStyle.popupContentContainer}>
								<h2 style={{ textAlign: 'center', margin: '0 0 15px 0' }}>Новое упражнение</h2>

								<div style={commonStyle.popupContentInputs}>
									<input
										type="text"
										style={commonStyle.popupInput}
										placeholder="Название упражнения"
										value={newExerciseName}
										onChange={(e) => {
											setModalError('');
											setNewExerciseName(e.target.value);
										}}
										autoFocus
									/>
								</div>

								{exactMatch && (
									<p style={{ ...styles.noExercises, margin: '0 0 8px 0', padding: '8px' }}>
										Уже есть в библиотеке: {exactMatch.name}
									</p>
								)}

								{modalError && (
									<p style={{ ...styles.error, margin: '0 0 8px 0', padding: '8px' }}>{modalError}</p>
								)}

								<div style={{ marginBottom: '12px', backgroundColor: colors.blueDark, borderRadius: '8px', padding: '12px' }}>
									<h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>Поиск по существующим упражнениям</h4>
									<div
										style={{
											maxHeight: '140px',
											overflowY: 'auto',
											display: 'flex',
											flexDirection: 'column',
											gap: '6px',
											padding: '8px',
											borderRadius: '8px',
										}}
									>
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
												style={{
													textAlign: 'left',
													padding: '6px 8px',
													borderRadius: '6px',
													border: '1px solid rgba(255,255,255,0.1)',
													background: colors.labelBG,
													color: '#fff',
													cursor: isCreatingExercise ? 'not-allowed' : 'pointer',
													opacity: isCreatingExercise ? 0.6 : 1,
												}}
											>
												{item.name}
											</button>
										))}
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
							</div>
						</div>
					</div>
				)}
			</div>
		</>
	);
}
