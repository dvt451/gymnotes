import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import ExerciseItem from './ExerciseItem/ExerciseItem';
import Templates from './Templates/Templates';
import { getToken } from '../../../components/utils/getToken';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { createExercisesStyles } from './ExersicesStyles';
import Header from '../../widgets/Header';
import { colors, createCommonStyle } from '../../../styles/commonStyle';
import { GlobalContext } from '../../../context/GlobalContext';

export default function Exercises() {
	const { trainingId, date } = useParams();
	const location = useLocation();
	const { trainingText, trainingTitle } = location.state || {};
	const [expandedExerciseId, setExpandedExerciseId] = useState(null);
	const { BASE_URL } = useContext(AuthContext);
	const [editState, setEditState] = useState(false)
	const [exercises, setExercises] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [newExerciseName, setNewExerciseName] = useState('');
	const { mainColor } = useContext(GlobalContext)

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
						}
					}
				);

				const exercisesArray = res.data.exercises || [];
				const normalized = exercisesArray.map(ex => ({
					...ex,
					id: ex._id?.toString() || ex.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
					weights: (ex.weights || []).map(w => ({
						...w,
						id: w._id?.toString() || w.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
						sets: (w.sets || []).map(s => ({
							...s,
							id: s._id?.toString() || s.id || `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
						}))
					}))
				}));
				setExercises(normalized);
			} catch (err) {
				console.error('Ошибка при загрузке упражнений:', err);
			}
		};

		loadExercises();
	}, [trainingId, date, BASE_URL]);

	const addExercise = async () => {
		if (!newExerciseName.trim()) return;

		try {
			setModalVisible(false);
			const token = await getToken();
			const res = await axios.post(
				`${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises`,
				{ name: newExerciseName },
				{
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			const newExercise = {
				...res.data,
				id: res.data._id?.toString(),
				weights: [],
			};

			setExercises(prev => [...prev, newExercise]);
			setNewExerciseName('');
		} catch (err) {
			console.error('Ошибка сохранения упражнения:', err);
		}
	};
	const today = new Date().toISOString().split('T')[0];

	return (
		<>
			<Header />
			<div style={styles.container}>
				<div style={styles.header}>
					<h1 style={styles.title}>
						{trainingText ? `${trainingText} — ` : ''}{trainingTitle}
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
						<span style={{ ...commonStyle.EditButtonText, ...{ color: editState && colors.orange, opacity: editState ? 1 : 0.25 } }}>{editState ? 'Editing...' : 'Edit...'}</span>
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
							/>
						))) : (
						<p style={styles.error}>Невозможно отобразить упражнения</p>
					)}
				</div>

				<button
					style={styles.addButton}
					onClick={() => setModalVisible(true)}
				>
					<span>➕</span>
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
										onChange={(e) => setNewExerciseName(e.target.value)}
										// onKeyPress={(e) => { if (e.key === 'Enter') addExercise(); }}
										autoFocus
									/>
								</div>

								<div style={commonStyle.popupButtons}>
									<button
										style={commonStyle.popupCreateButton}
										onClick={addExercise}
										disabled={!newExerciseName.trim()}
									>
										Сохранить
									</button>
									<button
										style={commonStyle.popupCancelButton}
										onClick={() => setModalVisible(false)}
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