import React, { useEffect, useState, useContext, useCallback } from 'react';
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
	const [exercisesError, setExercisesError] = useState('');
	const { mainColor } = useContext(GlobalContext);
	const [editState, setEditState] = useState(false);

	const styles = createExercisesStyles(mainColor);
	const today = new Date().toISOString().split('T')[0];

	const loadExercises = useCallback(async () => {
		setIsExercisesLoading(true);
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

			const exercisesArray = res.data.exercises || [];
			setExercises(exercisesArray.map(normalizeExercisePayload));
		} catch (err) {
			console.error('Error loading exercises:', err);
			setExercises([]);
			setExercisesError(
				err?.response?.data?.message ||
				err.message ||
				'Failed to load exercises for this day.'
			);
		} finally {
			setIsExercisesLoading(false);
		}
	}, [BASE_URL, trainingId, date]);

	useEffect(() => {
		loadExercises();
	}, [loadExercises]);

	useEffect(() => {
		setPreviousDateKey('');
		setPreviousExercisesByLibraryId({});
		setHasLoadedPreviousHistory(false);
		setIsPreviousHistoryLoading(false);
	}, [trainingId, date]);

	const loadPreviousHistory = useCallback(async () => {
		if (hasLoadedPreviousHistory || isPreviousHistoryLoading) {
			return;
		}

		setIsPreviousHistoryLoading(true);

		try {
			const token = getToken();
			if (!token) {
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
			const previousDate = getPreviousDateKey(
				dates.map((item) => normalizeDateKey(item?.date)),
				date
			);

			if (!previousDate) {
				setPreviousDateKey('');
				setPreviousExercisesByLibraryId({});
				setHasLoadedPreviousHistory(true);
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
				acc[libraryId] = {
					weights: Array.isArray(exercise.weights) ? exercise.weights : [],
					comment: typeof exercise.comment === 'string' ? exercise.comment : '',
				};
				return acc;
			}, {});

			setPreviousDateKey(previousDate);
			setPreviousExercisesByLibraryId(groupedByLibraryId);
			setHasLoadedPreviousHistory(true);
		} catch (err) {
			console.error('Error loading previous date exercises:', err);
			setPreviousDateKey('');
			setPreviousExercisesByLibraryId({});
			setHasLoadedPreviousHistory(true);
		} finally {
			setIsPreviousHistoryLoading(false);
		}
	}, [BASE_URL, trainingId, date, hasLoadedPreviousHistory, isPreviousHistoryLoading]);

	const openCreateModal = () => {
		setModalError('');
		setModalVisible(true);
	};

	useEffect(() => {
		loadPreviousHistory();
	}, [loadPreviousHistory]);

	const isPageLoading = isExercisesLoading || !hasLoadedPreviousHistory;

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
