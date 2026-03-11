import React, { useContext, useState } from 'react';
import { createExercisesStyles } from '../../ExersicesStyles';
import AddReps from './AddReps';
import DeleteReps from './DeleteReps';
import { colors, createCommonStyle } from '../../../../../styles/commonStyle';
import Popup from '../../../../widgets/Popup';
import { getToken } from '../../../../utils/getToken';
import { GlobalContext } from '../../../../../context/GlobalContext';

export default function Repeats({ BASE_URL, editState, isExpanded, trainingId, date, item: exercise, w: weight, setExercises }) {
	const [showEditPopup, setShowEditPopup] = useState(false);
	const [currentSet, setCurrentSet] = useState(null);
	const [newRepsInput, setNewRepsInput] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mainColor } = useContext(GlobalContext)

	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);

	const weightSetChangeHandler = async (set) => {
		if (!editState || !isExpanded) return;

		setCurrentSet(set);
		setNewRepsInput(set.reps.toString());
		setShowEditPopup(true);
	};

	const handleEditCancel = () => {
		setShowEditPopup(false);
		setCurrentSet(null);
		setNewRepsInput('');
	};

	const handleEditSubmit = async () => {
		if (!newRepsInput.trim() || !currentSet) return;

		const reps = parseInt(newRepsInput, 10);

		// If user entered 0 - delete the set
		if (reps === 0) {
			if (window.confirm('Delete this set?')) {
				await handleDeleteSet();
			}
			return;
		}

		if (isNaN(reps) || reps < 0) {
			alert('Enter a valid number of repetitions (positive number)');
			return;
		}

		setIsSubmitting(true);

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${exercise._id}/weights/${weight._id}/sets/${currentSet._id}`;

			const res = await fetch(url, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ reps }),
			});

			const data = await res.json();

			if (!res.ok) {
				throw new Error(data.message || `Error ${res.status}: Failed to modify set`);
			}

			// Update state with changed number of repetitions
			setExercises(prevExercises =>
				prevExercises.map(ex => {
					if (ex._id === exercise._id) {
						return {
							...ex,
							weights: ex.weights.map(wt => {
								if (wt._id === weight._id) {
									return {
										...wt,
										sets: wt.sets.map(s => {
											if (s._id === currentSet._id) {
												return { ...s, reps: reps };
											}
											return s;
										}),
									};
								}
								return wt;
							}),
						};
					}
					return ex;
				})
			);

			setShowEditPopup(false);
			setCurrentSet(null);
			setNewRepsInput('');

		} catch (err) {
			console.error('Error modifying set:', err);
			alert(`Error: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteSet = async () => {
		setIsSubmitting(true);

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${exercise._id}/weights/${weight._id}/sets/${currentSet._id}`;

			const res = await fetch(url, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Failed to delete set');
			}

			// Update state after deleting set
			setExercises(prevExercises =>
				prevExercises.map(ex => {
					if (ex._id === exercise._id) {
						return {
							...ex,
							weights: ex.weights.map(wt => {
								if (wt._id === weight._id) {
									return {
										...wt,
										sets: wt.sets.filter(s => s._id !== currentSet._id),
									};
								}
								return wt;
							}),
						};
					}
					return ex;
				})
			);

			setShowEditPopup(false);
			setCurrentSet(null);
			setNewRepsInput('');

		} catch (err) {
			console.error('Error deleting set:', err);
			alert(`Error: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleEditSubmit();
		}
	};

	return (
		<>
			<div style={{
				display: 'flex',
				width: '100%',
				alignItems: 'center',
				justifyContent: weight.sets.length > 0 ? 'space-between' : 'flex-end',
			}}>
				<div style={styles.repsContainer}>
					{weight.sets.length > 0 && <div>-</div>}
					<div style={styles.repsContainerRow}>
						{weight.sets.map((set, index) => (
							<button
								key={set._id || index}
								onClick={() => weightSetChangeHandler(set)}
								style={{
									background: 'none',
									border: 'none',
									cursor: editState && isExpanded ? 'pointer' : 'default',
									padding: '2px',
									margin: '0 2px',
								}}
								title={editState && isExpanded ? "Click to edit set\nEnter 0 to delete" : ""}
							>
								<span style={{
									...styles.setText,
									...(editState && isExpanded && {
										backgroundColor: colors.orange,
										padding: '0 4px',
										borderRadius: '4px',
										color: colors.black,
										position: 'relative',
									})
								}}>
									{set.reps}x
								</span>
							</button>
						))}
					</div>
				</div>
				{!editState && isExpanded && <AddReps
					BASE_URL={BASE_URL}
					trainingId={trainingId}
					date={date}
					exerciseId={exercise._id}
					weightId={weight._id}
					setExercises={setExercises}
				/>}
			</div>

			{/* Popup for editing set */}
			{showEditPopup && currentSet && (
				<Popup isOpen onClose={handleEditCancel}>
				<h3 style={{ textAlign: 'center', margin: 0, marginBottom: '15px' }}>
					Edit Set
				</h3>

				<div style={{
					textAlign: 'center',
					marginBottom: '20px',
					padding: '10px',
					backgroundColor: '#fff8f0',
					borderRadius: '5px',
					border: '1px solid #ffe0b2'
				}}>
					<p style={{ margin: '0 0 5px 0', fontSize: '14px', color: '#666' }}>
						Current repetitions: <strong>{currentSet.reps}x</strong>
					</p>
					<p style={{ margin: 0, fontSize: '12px', color: '#ff9800', fontWeight: 'bold' }}>
						💡 Enter 0 to delete set
					</p>
				</div>

				<div style={commonStyle.popupContentInputs}>
					<label style={{
						display: 'block',
						marginBottom: '8px',
						fontSize: '14px',
						color: '#555',
						fontWeight: '500'
					}}>
						New number of repetitions
					</label>
					<input
						type="number"
						min="0"
						step="1"
						value={newRepsInput}
						onChange={(e) => setNewRepsInput(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Enter new amount"
						style={commonStyle.popupInput}
						autoFocus
						disabled={isSubmitting}
					/>
				</div>

				<div style={commonStyle.popupButtons}>
					<button
						onClick={handleEditSubmit}
						style={{
							...commonStyle.popupCreateButton,
							opacity: isSubmitting ? 0.7 : 1,
							backgroundColor: newRepsInput === '0' ? colors.red : colors.blue,
						}}
						disabled={!newRepsInput.trim() || isSubmitting}
					>
						{isSubmitting
							? 'Saving...'
							: newRepsInput === '0'
								? '🗑️ Delete Set'
								: '💾 Save'
						}
					</button>

					<button
						onClick={handleEditCancel}
						style={commonStyle.popupCancelButton}
						disabled={isSubmitting}
					>
						Cancel
					</button>
				</div>
				</Popup>
			)}
		</>
	);
}
