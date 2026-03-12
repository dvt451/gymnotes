import React, { useContext, useState } from 'react';
import { createExercisesStyles } from '../../ExersicesStyles';
import AddReps from './AddReps';
import { colors, createCommonStyle } from '../../../../../styles/commonStyle';
import Popup from '../../../../widgets/Popup';
import { getToken } from '../../../../utils/getToken';
import { GlobalContext } from '../../../../../context/GlobalContext';
import { createPopupStyle } from '../../../../widgets/popupStyle';
import ButtonType from '../../../../widgets/ButtonType';

export default function Repeats({ BASE_URL, editState, isExpanded, trainingId, date, item: exercise, w: weight, setExercises }) {
	const [showEditPopup, setShowEditPopup] = useState(false);
	const [currentSetIndex, setCurrentSetIndex] = useState(null);
	const [newRepsInput, setNewRepsInput] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mainColor } = useContext(GlobalContext)
	const popupStyle = createPopupStyle(mainColor);

	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);

	const getRepsValue = (setValue) => {
		if (setValue && typeof setValue === 'object') {
			const repsValue = Number(setValue.reps);
			return Number.isFinite(repsValue) ? repsValue : 0;
		}
		const repsValue = Number(setValue);
		return Number.isFinite(repsValue) ? repsValue : 0;
	};

	const weightSetChangeHandler = async (setValue, setIndex) => {
		if (!editState || !isExpanded) return;

		setCurrentSetIndex(setIndex);
		setNewRepsInput(getRepsValue(setValue).toString());
		setShowEditPopup(true);
	};

	const handleEditCancel = () => {
		setShowEditPopup(false);
		setCurrentSetIndex(null);
		setNewRepsInput('');
	};

	const handleEditSubmit = async () => {
		if (!newRepsInput.trim() || currentSetIndex === null) return;

		const reps = parseInt(newRepsInput, 10);

		// If user entered 0 - delete the set
		if (reps === 0) {
			handleDeleteSet();
			return;
		}

		if (isNaN(reps) || reps < 0) {
			alert('Enter a valid number of repetitions (positive number)');
			return;
		}

		setIsSubmitting(true);

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${exercise._id}/weights/${weight._id}/sets/${currentSetIndex}`;

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
										sets: wt.sets.map((s, idx) => {
											if (idx === currentSetIndex) {
												return (s && typeof s === 'object') ? { ...s, reps } : reps;
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
			setCurrentSetIndex(null);
			setNewRepsInput('');

		} catch (err) {
			console.error('Error modifying set:', err);
			alert(`Error: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteSet = async () => {
		if (currentSetIndex === null) return;
		setIsSubmitting(true);

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${exercise._id}/weights/${weight._id}/sets/${currentSetIndex}`;

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
										sets: wt.sets.filter((_, idx) => idx !== currentSetIndex),
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
			setCurrentSetIndex(null);
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
						{weight.sets.map((setValue, index) => (
							<button
								key={index}
								onClick={() => weightSetChangeHandler(setValue, index)}
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
									{getRepsValue(setValue)}x
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
			{showEditPopup && currentSetIndex !== null && (
				<Popup isOpen onClose={handleEditCancel}>
					<h2 style={popupStyle.title}>Edit Set</h2>

					<div style={popupStyle.popupBodyContent}>
						<input
							type="number"
							min="0"
							step="1"
							value={newRepsInput}
							onChange={(e) => setNewRepsInput(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Enter new amount"
							style={popupStyle.popupInput}
							autoFocus
							disabled={isSubmitting}
						/>
					</div>

					<div style={commonStyle.popupButtons}>
						<ButtonType
							buttonType={newRepsInput === '0' ? 9 : 2}
							functionOnClick={handleEditSubmit}
						>
							{isSubmitting
								? 'Saving...'
								: newRepsInput === '0'
									? 'Delete Set'
									: 'Save'
							}
						</ButtonType>

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
