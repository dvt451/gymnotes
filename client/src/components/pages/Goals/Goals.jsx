import React, { useContext, useEffect, useMemo, useState } from 'react';
import Header from '../../widgets/Header';
import Footer from '../../widgets/Footer';
import { AuthContext } from '../../../context/AuthContext';
import { GlobalContext } from '../../../context/GlobalContext';
import { createGoalsStyles } from './GoalsStyles';
import { toRem } from '../../../styles/commonStyle';
import GoalForm from './GoalForm';
import GoalsList from './GoalsList';
import GoalProgress from './GoalProgress';
import Popup from '../../widgets/Popup';
import EditButton from '../Exercises/EditButton';

const initialFormState = {
	goalType: 'exercise',
	exerciseUserLibraryId: '',
	targetWeight: '',
	targetReps: '1',
	bodyPart: '',
	measurementUnit: 'kg',
	targetValue: '',
	skillName: '',
	notes: '',
};

export default function Goals() {
	const { BASE_URL, getToken } = useContext(AuthContext);
	const { mainColor } = useContext(GlobalContext);
	const goalsStyles = useMemo(() => createGoalsStyles(mainColor), [mainColor]);
	const [goals, setGoals] = useState([]);
	const [libraryExercises, setLibraryExercises] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [libraryLoading, setLibraryLoading] = useState(true);
	const [error, setError] = useState('');
	const [libraryError, setLibraryError] = useState('');
	const [formState, setFormState] = useState(initialFormState);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newGoalPopUpState, setNewGoalPopUpState] = useState(false);
	const [editState, setEditState] = useState(false);
	const loadGoals = async () => {
		setIsLoading(true);
		setError('');

		try {
			const token = getToken?.();
			const response = await fetch(`${BASE_URL}/api/goals`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				throw new Error('Failed to load goals');
			}

			const data = await response.json();
			setGoals(data.goals || []);
		} catch (err) {
			setError(err.message || 'Failed to load goals');
		} finally {
			setIsLoading(false);
		}
	};

	const loadExerciseLibrary = async () => {
		setLibraryLoading(true);
		setLibraryError('');

		try {
			const token = getToken?.();
			const response = await fetch(`${BASE_URL}/api/exercise-library`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to load exercise library');
			}

			const data = await response.json();
			setLibraryExercises(Array.isArray(data.userExercises) ? data.userExercises : []);
		} catch (err) {
			setLibraryError(err.message || 'Failed to load exercise library');
		} finally {
			setLibraryLoading(false);
		}
	};

	useEffect(() => {
		loadGoals();
		loadExerciseLibrary();
	}, [BASE_URL, getToken]);

	const handleInputChange = (event) => {
		const { name, value } = event.target;
		setFormState((prev) => ({ ...prev, [name]: value }));
	};

	const handleSelectChange = (value) => {
		setFormState((prev) => ({ ...prev, exerciseUserLibraryId: value }));
	};

	const handleSubmit = async (event) => {
		event.preventDefault();
		const goalType = formState.goalType || 'exercise';

		if (goalType === 'exercise') {
			if (!formState.exerciseUserLibraryId) {
				setError('Please choose an exercise from your library.');
				return;
			}
			if (!String(formState.targetWeight).trim()) {
				setError('Target weight is required.');
				return;
			}
			if (!String(formState.targetReps).trim()) {
				setError('Target reps are required.');
				return;
			}
			const selectedExercise = libraryExercises.find(
				(item) => String(item._id) === String(formState.exerciseUserLibraryId)
			);
			if (!selectedExercise) {
				setError('Please choose a valid exercise from your library.');
				return;
			}
		}

		if (goalType === 'body') {
			if (!String(formState.bodyPart).trim()) {
				setError('Body part is required.');
				return;
			}
			if (!String(formState.targetValue).trim()) {
				setError('Target value is required.');
				return;
			}
		}

		if (goalType === 'skill') {
			if (!String(formState.skillName).trim()) {
				setError('Skill or trick name is required.');
				return;
			}
		}

		const payload = {
			goalType,
			notes: formState.notes,
		};

		if (goalType === 'exercise') {
			payload.exerciseUserLibraryId = formState.exerciseUserLibraryId;
			payload.exerciseName = libraryExercises.find(
				(item) => String(item._id) === String(formState.exerciseUserLibraryId)
			)?.name || formState.exerciseUserLibraryId;
			payload.targetWeight = Number(formState.targetWeight);
			payload.targetReps = Number(formState.targetReps) || 1;
			payload.targetSets = 1;
		} else if (goalType === 'body') {
			payload.bodyPart = formState.bodyPart;
			payload.measurementUnit = formState.measurementUnit;
			payload.targetValue = Number(formState.targetValue);
		} else {
			payload.skillName = formState.skillName;
		}

		setIsSubmitting(true);
		setError('');

		try {
			const token = getToken?.();
			const response = await fetch(`${BASE_URL}/api/goals`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(payload),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to create goal');
			}

			const data = await response.json();
			setGoals((prev) => [data.goal, ...prev]);
			setFormState(initialFormState);
			setNewGoalPopUpState(false);
		} catch (err) {
			setError(err.message || 'Failed to create goal');
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDelete = async (goalId) => {
		try {
			const token = getToken?.();
			const response = await fetch(`${BASE_URL}/api/goals/${goalId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to delete goal');
			}

			setGoals((prev) => prev.filter((goal) => goal._id !== goalId));
		} catch (err) {
			setError(err.message || 'Failed to delete goal');
		}
	};

	const handleUpdateGoal = async (goalId, updatePayload) => {
		try {
			const token = getToken?.();
			const response = await fetch(`${BASE_URL}/api/goals/${goalId}`, {
				method: 'PATCH',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(updatePayload),
			});

			if (!response.ok) {
				const data = await response.json();
				throw new Error(data.message || 'Failed to update goal');
			}

			const data = await response.json();
			setGoals((prev) => prev.map((goal) => (goal._id === goalId ? data.goal : goal)));
			return data.goal;
		} catch (err) {
			setError(err.message || 'Failed to update goal');
			throw err;
		}
	};

	return (
		<>
			{/* <Gradient /> */}
			<div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
				<Header />
				<main style={goalsStyles.page}>
					<section style={goalsStyles.section}>
						{/* Page Header */}
						<div style={{ ...goalsStyles.pageHeader }}>
							<h2>Achivments</h2>

						</div>
						{/* Goal Progress */}
						<GoalProgress goals={goals} />

						<h3 style={{ ...goalsStyles.goalProgressTitle, marginTop: toRem(15) }}>My Goals</h3>

						{/* Goals List */}
						<GoalsList
							goals={goals}
							isLoading={isLoading}
							onDelete={handleDelete}
							onUpdateGoal={handleUpdateGoal}
							editState={editState}
						/>
						<button
							type="button"
							style={goalsStyles.addButton}
							onClick={() => setNewGoalPopUpState(true)}
						>
							+	Add New Goal
						</button>
						<EditButton
							editState={editState}
							setEditState={setEditState}
						/>
					</section>
					<Popup isOpen={newGoalPopUpState} onClose={() => setNewGoalPopUpState(false)}>
						{/* Goal Form */}
						<GoalForm
							formState={formState}
							libraryExercises={libraryExercises}
							libraryLoading={libraryLoading}
							libraryError={libraryError}
							error={error}
							isSubmitting={isSubmitting}
							onInputChange={handleInputChange}
							onSelectChange={handleSelectChange}
							onSubmit={handleSubmit}
						/>
					</Popup>
				</main>
				<Footer />
			</div>
		</>
	);
}
