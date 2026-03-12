import React, { useEffect, useState, useContext } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import Templates from './Templates/Templates';
import { getToken } from '../../../components/utils/getToken';
import { AuthContext } from '../../../context/AuthContext';
import axios from 'axios';
import { createExercisesStyles } from './ExersicesStyles';
import Header from '../../widgets/Header';
import { GlobalContext } from '../../../context/GlobalContext';

import ButtonType from '../../widgets/ButtonType';
import ExercisesList from './ExercisesList';
import AddExercisePopup from './AddExercisePopup';



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
	const { mainColor } = useContext(GlobalContext);

	const styles = createExercisesStyles(mainColor);


	const openCreateModal = () => {
		setModalError('');
		setModalVisible(true);
	};

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
					existingExercises={exercises}
				/>
				<ExercisesList
					exercises={exercises}
					setExercises={setExercises}
					date={date}
					trainingId={trainingId}
					BASE_URL={BASE_URL}
					previousExercisesByLibraryId={previousExercisesByLibraryId}
					previousDateKey={previousDateKey}
				/>

				<ButtonType addStyle={styles.addButton} functionOnClick={openCreateModal}>
					<span>+</span>
					<span>Add Exercise</span>
				</ButtonType>
			</div>
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
				setPreviousDateKey={setPreviousDateKey}
				setPreviousExercisesByLibraryId={setPreviousExercisesByLibraryId}
			/>
		</>
	);
}

