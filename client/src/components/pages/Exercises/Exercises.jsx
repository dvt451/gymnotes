import React, { useEffect, useState, useContext, useCallback, useRef } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Templates from './Templates/Templates';
import { getToken } from '../../../components/utils/getToken';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { createExercisesStyles } from './ExersicesStyles';
import Header from '../../widgets/Header';
import { GlobalContext } from '../../../context/GlobalContext';
import '../../../styles/scss/exercises.scss';
import ButtonType from '../../widgets/ButtonType';
import ExercisesList from './ExercisesList';
import AddExercisePopup from './AddExercisePopup';
import EditButton from './EditButton';
import SectionSkeleton from '../../widgets/Loading/SectionSkeleton';
import InlineSpinner from '../../widgets/InlineSpinner';

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

const normalizeDateKey = (value) => {
	if (!value) return '';
	const str = String(value);
	return str.includes('T') ? str.split('T')[0] : str;
};

export default function Exercises() {
	const { trainingId, date } = useParams();
	const location = useLocation();
	const { trainingText, trainingTitle } = location.state || {};
	const { BASE_URL } = useContext(AuthContext);
	const [exercises, setExercises] = useState([]);
	const [userExercises, setUserExercises] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [modalError, setModalError] = useState('');
	const [previousDateKey, setPreviousDateKey] = useState('');
	const [previousExercisesByLibraryId, setPreviousExercisesByLibraryId] = useState({});
	const [hasLoadedPreviousHistory, setHasLoadedPreviousHistory] = useState(false);
	const [isPreviousHistoryLoading, setIsPreviousHistoryLoading] = useState(false);
	const [isExercisesLoading, setIsExercisesLoading] = useState(true);
	const [isApplyingTemplate, setIsApplyingTemplate] = useState(false);
	const [exercisesError, setExercisesError] = useState('');
	const { mainColor } = useContext(GlobalContext);
	const [editState, setEditState] = useState(false);
	const exerciseRequestRef = useRef(0);
	const previousHistoryRequestRef = useRef(0);

	const styles = createExercisesStyles(mainColor);
	const today = new Date().toISOString().split('T')[0];

	const loadExercises = useCallback(async () => {
		const requestId = ++exerciseRequestRef.current;
		setIsExercisesLoading(true);
		setExercises([]);
		setExercisesError('');
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

			if (requestId !== exerciseRequestRef.current) return;

			const exercisesArray = res.data.exercises || [];
			setExercises(exercisesArray.map(normalizeExercisePayload));
		} catch (err) {
			if (requestId !== exerciseRequestRef.current) return;
			console.error('Error loading exercises:', err);
			setExercises([]);
			setExercisesError(
				err?.response?.data?.message ||
				err.message ||
				'Failed to load exercises for this day.'
			);
		} finally {
			if (requestId === exerciseRequestRef.current) {
				setIsExercisesLoading(false);
			}
		}
	}, [BASE_URL, trainingId, date]);

	useEffect(() => {
		exerciseRequestRef.current += 1;
		setExercises([]);
		setExercisesError('');
		setPreviousDateKey('');
		setPreviousExercisesByLibraryId({});
		setHasLoadedPreviousHistory(false);
		setIsPreviousHistoryLoading(false);
		setIsExercisesLoading(true);
		loadExercises();
	}, [loadExercises]);

	const loadPreviousHistory = useCallback(async () => {
		const requestId = ++previousHistoryRequestRef.current;
		if (isPreviousHistoryLoading) {
			return;
		}

		setIsPreviousHistoryLoading(true);

		try {
			const token = getToken();
			if (!token) {
				if (requestId !== previousHistoryRequestRef.current) return;
				setPreviousDateKey('');
				setPreviousExercisesByLibraryId({});
				setHasLoadedPreviousHistory(true);
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
			const normalizedDates = [...new Set(
				dates.map((item) => normalizeDateKey(item?.date)).filter(Boolean)
			)].sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
			const currentDateKey = normalizeDateKey(date);
			const previousDates = normalizedDates.filter(
				(dateKey) => new Date(dateKey).getTime() < new Date(currentDateKey).getTime()
			);

			if (requestId !== previousHistoryRequestRef.current) return;

			if (previousDates.length === 0) {
				if (requestId !== previousHistoryRequestRef.current) return;
				setPreviousDateKey('');
				setPreviousExercisesByLibraryId({});
				setHasLoadedPreviousHistory(true);
				return;
			}

			const historyByLibraryId = {};
			const hasMeaningfulHistoryData = (exercise) => {
				const comment = typeof exercise.comment === 'string' ? exercise.comment.trim() : '';
				const weights = Array.isArray(exercise.weights) ? exercise.weights : [];
				const hasWeights = weights.some((weight) => {
					const numericWeight = Number(weight?.weight);
					const hasWeightValue = !Number.isNaN(numericWeight) && numericWeight > 0;
					const hasSets = Array.isArray(weight?.sets) && weight.sets.some((set) => {
						const reps = Number(set?.reps ?? set);
						return !Number.isNaN(reps) && reps > 0;
					});
					return hasWeightValue || hasSets;
				});

				return hasWeights || Boolean(comment);
			};

			for (const historyDate of [...previousDates].reverse()) {
				const exercisesResponse = await axios.get(
					`${BASE_URL}/api/trainings/${trainingId}/dates/${historyDate}/exercises`,
					{ headers }
				);
				const historyExercises = Array.isArray(exercisesResponse.data?.exercises)
					? exercisesResponse.data.exercises
					: [];

				historyExercises.forEach((exercise) => {
					const libraryId = String(exercise.exerciseUserLibraryId || '');
					if (!libraryId) return;

					const existingEntries = historyByLibraryId[libraryId] || [];
					if (existingEntries.length >= 2) return;
					if (!hasMeaningfulHistoryData(exercise)) return;

					historyByLibraryId[libraryId] = [
						...existingEntries,
						{
							weights: Array.isArray(exercise.weights) ? exercise.weights : [],
							comment: typeof exercise.comment === 'string' ? exercise.comment : '',
							date: historyDate,
						},
					];
				});
			}

			if (requestId !== previousHistoryRequestRef.current) return;

			setPreviousDateKey(previousDates[previousDates.length - 1] || '');
			setPreviousExercisesByLibraryId(historyByLibraryId);
			setHasLoadedPreviousHistory(true);
		} catch (err) {
			if (requestId !== previousHistoryRequestRef.current) return;
			console.error('Error loading previous date exercises:', err);
			setPreviousDateKey('');
			setPreviousExercisesByLibraryId({});
			setHasLoadedPreviousHistory(true);
		} finally {
			if (requestId === previousHistoryRequestRef.current) {
				setIsPreviousHistoryLoading(false);
				setHasLoadedPreviousHistory(true);
			}
		}
	}, [BASE_URL, trainingId, date]);

	const openCreateModal = () => {
		setModalError('');
		setModalVisible(true);
	};

	useEffect(() => {
		loadPreviousHistory();
	}, [loadPreviousHistory]);

	const isPageLoading = isExercisesLoading;

	return (
		<>
			<Header />
			<div className='exercise-page'>
				<div className='exercise-page__title-header'>
					<h1 className='exercise-page__title'>
						{trainingText ? `${trainingText} — ` : ''}
						{trainingTitle}
					</h1>
					<p className='exercise-page__date'>{date === today ? (<span>
						Today <span className='seperator-dot'></span>
						{date}</span>) : date}</p>
				</div>

				{isPageLoading ? (
					<>
						<div style={{ marginBottom: '20px' }}>
							<SectionSkeleton
								showHeader={false}
								lines={1}
								lineHeight={40}
							/>
						</div>
						<div style={{ marginBottom: '20px' }}>
							<SectionSkeleton
								showHeader={true}
								headerWidth='28%'
								headerAsideWidth='0%' Q
								cards={3}
								cardHeight={110}
								cardGap={15}
							/>
						</div>
					</>
				) : exercisesError ? (
					<div style={styles.error}>
						<p>{exercisesError}</p>
						<div style={{ marginTop: '16px' }}>
							<ButtonType functionOnClick={loadExercises}>
								Try Again
							</ButtonType>
						</div>
					</div>
				) : (
					<>
						<Templates
							setExercises={setExercises}
							trainingId={trainingId}
							date={date}
							BASE_URL={BASE_URL}
							styles={styles}
							existingExercises={exercises}
							setIsApplyingTemplate={setIsApplyingTemplate}
						/>
						<ExercisesList
							exercises={exercises}
							setExercises={setExercises}
							editState={editState}
							date={date}
							trainingId={trainingId}
							BASE_URL={BASE_URL}
							isPreviousHistoryLoading={isPreviousHistoryLoading}
							previousExercisesByLibraryId={previousExercisesByLibraryId}
							previousDateKey={previousDateKey}
							isApplyingTemplate={isApplyingTemplate}
						/>

						<ButtonType addStyle={styles.addButton} functionOnClick={openCreateModal}>
							<span>+</span>
							<span>Add Exercise</span>
						</ButtonType>
					</>
				)}
			</div>
			{!isExercisesLoading && !exercisesError && (
				<EditButton
					editState={editState}
					setEditState={setEditState}
				/>
			)}
			<AddExercisePopup
				userExercises={userExercises}
				BASE_URL={BASE_URL}
				trainingId={trainingId}
				date={date}
				exercises={exercises}
				setExercises={setExercises}
				setModalVisible={setModalVisible}
				modalError={modalError}
				setModalError={setModalError}
				modalVisible={modalVisible}
				setUserExercises={setUserExercises}
			/>
		</>
	);
}
