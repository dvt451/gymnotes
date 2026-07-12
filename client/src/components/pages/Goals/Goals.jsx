import React, { useContext, useEffect, useMemo, useState } from 'react';
import Header from '../../widgets/Header';
import Footer from '../../widgets/Footer';
import Gradient from '../../widgets/Gradient';
import { AuthContext } from '../../../context/AuthContext';
import { GlobalContext } from '../../../context/GlobalContext';
import { createGoalsStyles } from './GoalsStyles';
import { createCommonStyle, toRem } from '../../../styles/commonStyle';
import GoalForm from './GoalForm';
import GoalsList from './GoalsList';
import GoalProgress from './GoalProgress';
import Popup from '../../widgets/Popup';

const initialFormState = {
	exerciseUserLibraryId: '',
	targetWeight: '',
	targetSets: '1',
};

export default function Goals() {
	const { BASE_URL, getToken } = useContext(AuthContext);
	const { mainColor } = useContext(GlobalContext);
	const goalsStyles = useMemo(() => createGoalsStyles(mainColor), [mainColor]);
	const commonStyle = createCommonStyle(mainColor);
	const [goals, setGoals] = useState([]);
	const [libraryExercises, setLibraryExercises] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [libraryLoading, setLibraryLoading] = useState(true);
	const [error, setError] = useState('');
	const [libraryError, setLibraryError] = useState('');
	const [formState, setFormState] = useState(initialFormState);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [newGoalPopUpState, setNewGoalPopUpState] = useState(false);
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

		if (!formState.exerciseUserLibraryId) {
			setError('Please choose an exercise from your library.');
			return;
		}

		if (!String(formState.targetWeight).trim()) {
			setError('Target weight is required.');
			return;
		}

		const selectedExercise = libraryExercises.find(
			(item) => String(item._id) === String(formState.exerciseUserLibraryId)
		);

		if (!selectedExercise) {
			setError('Please choose a valid exercise from your library.');
			return;
		}

		const payload = {
			exerciseUserLibraryId: formState.exerciseUserLibraryId,
			exerciseName: selectedExercise.name,
			targetWeight: Number(formState.targetWeight),
			targetSets: Number(formState.targetSets) || 1,
			targetReps: 0,
		};

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
						/>
						<button
							type="button"
							style={goalsStyles.addButton}
							onClick={() => setNewGoalPopUpState(true)}
						>
							+	Add New Goal
						</button>
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
