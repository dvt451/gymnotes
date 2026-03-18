import React, { useContext, useState } from 'react';
import { createExercisesStyles } from './ExersicesStyles';
import { GlobalContext } from '../../../context/GlobalContext';
import { colors, createCommonStyle } from '../../../styles/commonStyle';
import Popup from '../../widgets/Popup';
import { createPopupStyle } from '../../widgets/popupStyle';
import MuscleGroupSelect from '../../widgets/MuscleGroupSelect';
import {
	filterExercisesByName,
	findExactExerciseMatch,
} from './handleCreateExercise';
import {
	DEFAULT_MUSCLE_GROUP,
	buildMuscleGroupList,
	normalizeExerciseMuscleGroup,
} from './muscleGroups';

export default function CreateExerciseButton({
	existingExercises = [],
	onCreateExercise,
	muscleGroups = [],
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);
	const popupStyle = createPopupStyle(mainColor);
	const [modalVisible, setModalVisible] = useState(false);
	const [newExerciseName, setNewExerciseName] = useState('');
	const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(DEFAULT_MUSCLE_GROUP);
	const [errorMessage, setErrorMessage] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const exactMatch = findExactExerciseMatch(existingExercises, newExerciseName);
	const duplicatedName = exactMatch?.name;
	const filteredExercises = filterExercisesByName(existingExercises, newExerciseName);

	const closeModal = () => {
		setModalVisible(false);
		setNewExerciseName('');
		setSelectedMuscleGroup(DEFAULT_MUSCLE_GROUP);
		setErrorMessage('');
	};

	const addExercise = async () => {
		if (!newExerciseName.trim()) return;
		if (typeof onCreateExercise !== 'function') return;

		setIsSaving(true);
		setErrorMessage('');

		try {
			const result = await onCreateExercise(
				newExerciseName,
				normalizeExerciseMuscleGroup(selectedMuscleGroup, muscleGroups)
			);
			if (!result?.success) {
				setErrorMessage(result?.message || 'Failed to create exercise');
				return;
			}

			closeModal();
		} catch (err) {
			setErrorMessage(err.message || 'Failed to create exercise');
		} finally {
			setIsSaving(false);
		}
	};

	const handleOpenModal = () => {
		setErrorMessage('');
		setSelectedMuscleGroup(DEFAULT_MUSCLE_GROUP);
		setModalVisible(true);
	};

	return (
		<>
			<button style={styles.addButton} onClick={handleOpenModal}>
				<span>+</span>
				<span>Add Exercise</span>
			</button>
			<Popup isOpen={modalVisible} onClose={closeModal}>
				<h2 style={{ textAlign: 'center', margin: '0 0 15px 0', color: '#fff' }}>New Exercise</h2>

				<div style={popupStyle.popupContentInputs}>
					<input
						type="text"
						style={popupStyle.popupInput}
						placeholder="Exercise name"
						value={newExerciseName}
						onChange={(e) => setNewExerciseName(e.target.value)}
						autoFocus
					/>
					<MuscleGroupSelect
						style={popupStyle.popupInput}
						value={selectedMuscleGroup}
						onChange={setSelectedMuscleGroup}
						options={buildMuscleGroupList(muscleGroups)}
					/>
				</div>

				{duplicatedName && (
					<p style={{ ...styles.error, margin: '0 0 12px 0', padding: '10px' }}>
						Exercise already exists: {duplicatedName}
					</p>
				)}

				{errorMessage && (
					<p style={{ ...styles.error, margin: '0 0 12px 0', padding: '10px' }}>
						{errorMessage}
					</p>
				)}

				<div
					style={popupStyle.popupLibraryBlock}
				>
					<h3 style={popupStyle.title}>Library</h3>
					<div style={popupStyle.libraryList}>
						{existingExercises.length === 0 && (
							<span style={{ color: '#c7d1db', fontSize: '14px' }}>Empty</span>
						)}
						{existingExercises.length > 0 && filteredExercises.length === 0 && (
							<span style={{ color: '#c7d1db', fontSize: '14px' }}>No matches found</span>
						)}
						{filteredExercises.map((item) => (
							<button
								key={item._id || item.id || item.name}
								type="button"
								onClick={() => {
									setErrorMessage('');
									setNewExerciseName(item.name || '');
									setSelectedMuscleGroup(
										normalizeExerciseMuscleGroup(item.muscleGroup, muscleGroups)
									);
								}}
								style={popupStyle.libraryItem}
							>
								{item.name} ({normalizeExerciseMuscleGroup(item.muscleGroup, muscleGroups)})
							</button>
						))}
					</div>
				</div>

				<div style={commonStyle.popupButtons}>
					<button
						style={commonStyle.popupCreateButton}
						onClick={addExercise}
						disabled={!newExerciseName.trim() || Boolean(duplicatedName) || isSaving}
					>
						{isSaving ? 'Saving...' : 'Save'}
					</button>
					<button
						style={commonStyle.popupCancelButton}
						onClick={closeModal}
						disabled={isSaving}
					>
						Cancel
					</button>
				</div>
			</Popup>
		</>
	);
}
