const fs = require('fs');
const path = 'client/src/components/pages/Goals/Goals.jsx';
const content = `import React, { useContext, useEffect, useMemo, useState } from 'react';
import Header from '../../widgets/Header';
import Footer from '../../widgets/Footer';
import Gradient from '../../widgets/Gradient';
import { AuthContext } from '../../../context/AuthContext';
import { GlobalContext } from '../../../context/GlobalContext';
import { createGoalsStyles } from './GoalsStyles';
import { createCommonStyle } from '../../../styles/commonStyle';
import Select from '../../widgets/Select.jsx';
import { createPopupStyle } from '../../widgets/popupStyle';

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
	const popupStyle = createPopupStyle();

	const loadGoals = async () => {
		setIsLoading(true);
		setError('');

		try {
			const token = getToken?.();
			const response = await fetch(`${ BASE_URL }/api/goals`, {
				headers: {
					Authorization: `Bearer ${ token } `,
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
			const response = await fetch(`${ BASE_URL } /api/exercise - library`, {
				headers: {
					Authorization: `Bearer ${ token } `,
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

		if (!formState.targetWeight.trim()) {
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
			const response = await fetch(`${ BASE_URL } /api/goals`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${ token } `,
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
			const response = await fetch(`${ BASE_URL } /api/goals / ${ goalId } `, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${ token } `,
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

	const goalCount = goals.length;

	return (
		<>
			<Gradient />
			<div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
				<Header />
				<main style={goalsStyles.page}>
					<section style={goalsStyles.section}>
						<div style={{ ...commonStyle.titleHeader, ...goalsStyles.titleHeader }}>
							<div>
								<h2 style={goalsStyles.title}>Goals</h2>
								<p style={goalsStyles.description}>
									Create workout goals, track progress and mark achievements when your entries match the target.
								</p>
							</div>
							<button
								type="button"
								style={goalsStyles.addButton}
								onClick={() => document.getElementById('goal-form')?.scrollIntoView({ behavior: 'smooth' })}
							>
								Add Goal
							</button>
						</div>

						<div style={goalsStyles.card} id="goal-form">
							<h3 style={goalsStyles.goalTitle}>New goal</h3>
							<form onSubmit={handleSubmit} style={{ display: 'grid', gap: '14px' }}>
								<div style={goalsStyles.formRow}>
									<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
										<label style={goalsStyles.metaLabel}>Exercise</label>
										<Select
											options={libraryExercises.map((exercise) => ({ value: exercise._id, label: exercise.name }))}
											value={formState.exerciseUserLibraryId}
											onChange={handleSelectChange}
											style={popupStyle.popupInput}
											disabled={libraryLoading}
											placeholder="Choose exercise from library"
										/>
										{libraryError && <p style={{ color: 'tomato', margin: 0 }}>{libraryError}</p>}
										{!libraryLoading && libraryExercises.length === 0 && (
											<p style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>
												Add exercises in the library before creating a goal.
											</p>
										)}
									</div>
								</div>

								<div style={goalsStyles.formRow}>
									<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
										<label style={goalsStyles.metaLabel}>Target weight</label>
										<input
											name="targetWeight"
											type="number"
											value={formState.targetWeight}
											onChange={handleInputChange}
											min="0"
											step="0.5"
											placeholder="kg"
											style={popupStyle.popupInput}
										/>
									</div>
									<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
										<label style={goalsStyles.metaLabel}>Approach</label>
										<input
											name="targetSets"
											type="number"
											value={formState.targetSets}
											onChange={handleInputChange}
											min="1"
											step="1"
											style={popupStyle.popupInput}
										/>
									</div>
								</div>

								{error && <p style={{ color: 'tomato' }}>{error}</p>}
								<button type="submit" style={{ ...goalsStyles.addButton, width: 'fit-content' }} disabled={isSubmitting}>
									{isSubmitting ? 'Saving...' : 'Create goal'}
								</button>
							</form>
						</div>

						{isLoading ? (
							<div style={goalsStyles.statusCard}>
								<p style={goalsStyles.statusText}>Loading goals...</p>
							</div>
						) : goalCount === 0 ? (
							<div style={goalsStyles.statusCard}>
								<p style={goalsStyles.statusText}>No goals yet. Add your first target to start tracking achievements.</p>
							</div>
						) : (
							<div style={goalsStyles.goalGrid}>
								{goals.map((goal) => (
									<div key={goal._id} style={goalsStyles.goalCard}>
										<div style={goalsStyles.goalHeader}>
											<div>
												<h3 style={goalsStyles.goalTitle}>{goal.exerciseName}</h3>
												<p style={goalsStyles.metaLabel}>{goal.notes || 'Track matching training entries against this goal.'}</p>
											</div>
											<span
											style={{
												...goalsStyles.statusBadge,
												backgroundColor: goal.progress.isAchieved ? '#92E33C33' : '#FFCC0033',
												color: goal.progress.isAchieved ? '#92E33C' : '#FFCC00',
											}}
										>
												{goal.progress.isAchieved ? 'Achieved' : 'In progress'}
											</span>
										</div>
										<div style={goalsStyles.goalMeta}>
											<div style={goalsStyles.metaItem}>
												<span style={goalsStyles.metaLabel}>Target</span>
												<strong style={goalsStyles.metaValue}>{`${ goal.targetWeight } kg × ${ goal.targetSets } sets${ goal.targetReps > 0 ? ` × ${goal.targetReps} reps` : '' } `}</strong>
											</div>
											<div style={goalsStyles.metaItem}>
												<span style={goalsStyles.metaLabel}>Progress</span>
												<strong style={goalsStyles.metaValue}>{`${ goal.progress.matchedSets } /${goal.progress.targetSets} sets`}</strong >
											</div >
										</div >
										<div style={goalsStyles.progressBar}>
											<div
												style={{
													...goalsStyles.progressFill,
													width: `${goal.progress.progressPercent}%`,
												}}
											/>
										</div>
										<div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
											<div style={{ ...goalsStyles.metaItem, width: '100%' }}>
												<span style={goalsStyles.metaLabel}>Best matching weight</span>
												<strong style={goalsStyles.metaValue}>{goal.progress.highestWeight ? `${goal.progress.highestWeight} kg` : 'Not met yet'}</strong>
											</div>
										</div>
{
	goal.progress.achievedAt && (
		<p style={{ opacity: 0.75, margin: 0 }}>
			Achieved on {new Date(goal.progress.achievedAt).toLocaleDateString()}
		</p>
	)
}
<div style={goalsStyles.actionRow}>
	<button
		type="button"
		style={goalsStyles.deleteButton}
		onClick={() => handleDelete(goal._id)}
	>
		Delete goal
	</button>
</div>
									</div >
								))}
							</div >
						)}
					</section >
				</main >
	<Footer />
			</div >
		</>
	);
}
`;
fs.writeFileSync(path, content, 'utf8');
console.log('Goals.jsx rewritten successfully');
NODE