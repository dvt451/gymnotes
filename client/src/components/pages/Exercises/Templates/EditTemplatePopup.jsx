import React, { useContext, useState } from 'react';
import Popup from '../../../widgets/Popup';
import { createPopupStyle } from '../../../widgets/popupStyle';
import { createCommonStyle, colors } from '../../../../styles/commonStyle';
import { GlobalContext } from '../../../../context/GlobalContext';
import { createTemplatesStyles } from './TemplatesStyles';
import ButtonType from '../../../widgets/ButtonType';
import { AuthContext } from '../../../../context/AuthContext';
import { getToken } from '../../../utils/getToken';
import {
	handleCreateExercise,
	findExactExerciseMatch,
	normalizeExerciseName,
} from '../../exerciseLibrary/handleCreateExercise';
import {
	DEFAULT_MUSCLE_GROUP,
	normalizeExerciseMuscleGroup,
} from '../../exerciseLibrary/muscleGroups';
import MuscleGroupSelect from '../../../widgets/MuscleGroupSelect';

export default function EditTemplatePopup({
	editModalVisible,
	editingTemplateName,
	newExerciseName,
	exactMatch,
	filteredExistingExercises,
	editingExercises,
	setEditModalVisible,
	setEditingTemplateName,
	setEditingExercises,
	setNewExerciseName,
	editingTemplateId,
	modalError,
	userExercises,
	showNotificationMessage,
	trainingId,
	setTemplates,
	addExistingExerciseToTemplate,
	setIsCreatingExercise,
	isCreatingExercise,
	setModalError,
	setUserExercises,
	addExerciseToTemplateList,
}) {
	const { BASE_URL } = useContext(AuthContext);
	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);
	const popupStyle = createPopupStyle(mainColor);
	const templatesStyles = createTemplatesStyles(mainColor);
	const [selectedMuscleGroup, setSelectedMuscleGroup] = useState(DEFAULT_MUSCLE_GROUP);
	const errorStyle = {
		backgroundColor: colors.red,
		color: '#fff',
		borderRadius: '8px',
		fontSize: '14px',
	};

	const normalizedInput = normalizeExerciseName(newExerciseName);
	const shouldCreateExercise = Boolean(normalizedInput) && !exactMatch;

	const closeModal = () => {
		setEditModalVisible(false);
		setSelectedMuscleGroup(DEFAULT_MUSCLE_GROUP);
		setModalError('');
		setNewExerciseName('');
	};

	const saveEditedTemplate = async () => {
		if (!editingTemplateName.trim()) {
			alert('Enter template name');
			return;
		}

		const updated = {
			name: editingTemplateName.trim(),
			exercises: editingExercises.map((name) => ({ name })),
		};

		try {
			const token = await getToken();
			const res = await fetch(
				`${BASE_URL}/api/trainings/${trainingId}/templates/${editingTemplateId}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify(updated),
				}
			);

			if (!res.ok) {
				const text = await res.text();
				console.error('Server error editing template:', res.status, text);
				showNotificationMessage(`Error updating template: ${text}`);
				return;
			}

			const updatedTemplate = await res.json();
			setTemplates((prev) =>
				prev.map((t) => (t._id === updatedTemplate._id ? updatedTemplate : t))
			);

			closeModal();
			showNotificationMessage('Template updated successfully');
		} catch (err) {
			console.error('Error editing template:', err);
			showNotificationMessage(`Error: ${err.message}`);
		}
	};

	const deleteTemplate = async () => {
		if (!window.confirm('Delete template? This action cannot be undone.')) return;

		try {
			const token = await getToken();
			const res = await fetch(
				`${BASE_URL}/api/trainings/${trainingId}/templates/${editingTemplateId}`,
				{
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				}
			);

			if (!res.ok) {
				const text = await res.text();
				console.error('Server error deleting template:', res.status, text);
				showNotificationMessage(`Error deleting template: ${text}`);
				return;
			}

			setTemplates((prev) => prev.filter((t) => t._id !== editingTemplateId));
			closeModal();
			showNotificationMessage('Template deleted');
		} catch (err) {
			console.error('Error deleting template:', err);
			showNotificationMessage(`Error: ${err.message}`);
		}
	};

	const removeExerciseFromEditing = (name) => {
		setEditingExercises((prev) => prev.filter((ex) => ex !== name));
	};

	const moveExerciseInEditingList = (index, direction) => {
		setEditingExercises((prev) => {
			const next = [...prev];
			const newIndex = index + direction;
			if (newIndex < 0 || newIndex >= next.length) return prev;
			[next[index], next[newIndex]] = [next[newIndex], next[index]];
			return next;
		});
	};

	const addExerciseToEditing = async () => {
		await addExerciseFromInput('edit');
	};

	const addExerciseFromInput = async (mode) => {
		if (!normalizedInput || isCreatingExercise) return;

		setIsCreatingExercise(true);
		setModalError('');

		try {
			const existing = findExactExerciseMatch(userExercises, normalizedInput);
			if (existing) {
				addExerciseToTemplateList(existing.name || normalizedInput, mode);
				setNewExerciseName('');
				setSelectedMuscleGroup(DEFAULT_MUSCLE_GROUP);
				return;
			}

			const createResult = await handleCreateExercise({
				BASE_URL,
				exerciseName: normalizedInput,
				existingExercises: userExercises,
				muscleGroup: selectedMuscleGroup,
			});

			if (!createResult.success) {
				setModalError(createResult.message || 'Failed to create exercise');
				return;
			}

			const matchedExercise =
				createResult.exercise || findExactExerciseMatch(userExercises, normalizedInput);

			if (createResult.exercise) {
				setUserExercises((prev) => {
					const existsById = prev.some(
						(item) =>
							String(item._id || item.id) ===
							String(createResult.exercise._id || createResult.exercise.id)
					);
					if (existsById) return prev;

					return [...prev, createResult.exercise].sort((a, b) =>
						(a.name || '').localeCompare(b.name || '')
					);
				});
			}

			addExerciseToTemplateList(matchedExercise?.name || normalizedInput, mode);
			setNewExerciseName('');
			setSelectedMuscleGroup(DEFAULT_MUSCLE_GROUP);
		} finally {
			setIsCreatingExercise(false);
		}
	};

	return (
		<Popup
			isOpen={editModalVisible}
			onClose={closeModal}
			contentStyle={{ ...templatesStyles.modalContent, ...commonStyle.popupContent }}
			contentLayerStyle={{ ...templatesStyles.modalContentLayer, ...commonStyle.popupContentLayer }}
			containerStyle={{ ...templatesStyles.modalContentContainer, ...commonStyle.popupContentContainer }}
		>
			<h3 style={popupStyle.title}>Edit Template</h3>

			<div style={popupStyle.popupBodyContent}>
				<input
					type="text"
					placeholder="Template name"
					value={editingTemplateName}
					onChange={(e) => setEditingTemplateName(e.target.value)}
					style={popupStyle.popupInput}
				/>
				<div style={popupStyle.popupContentInputs}>
					<input
						type="text"
						placeholder="Add exercise"
						value={newExerciseName}
						onChange={(e) => setNewExerciseName(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								e.preventDefault();
								addExerciseToEditing();
							}
						}}
						style={popupStyle.popupInput}
					/>
					<ButtonType
						addStyle={{ width: 'auto', flex: '1 1 auto', whiteSpace: 'nowrap' }}
						buttonType={7}
						functionOnClick={addExerciseToEditing}
					>
						{shouldCreateExercise ? 'Create Exercise' : '+ Exercise'}
					</ButtonType>
				</div>

				{shouldCreateExercise && (
					<MuscleGroupSelect
						style={popupStyle.popupInput}
						value={selectedMuscleGroup}
						onChange={setSelectedMuscleGroup}
						disabled={isCreatingExercise}
					/>
				)}

				{exactMatch && (
					<p style={{ ...errorStyle, margin: '0 0 12px 0', padding: '10px' }}>
						Exercise already exists: {exactMatch.name}
					</p>
				)}

				{modalError && (
					<p style={{ ...errorStyle, margin: '0 0 12px 0', padding: '10px' }}>
						{modalError}
					</p>
				)}
				<div style={popupStyle.popupLibraryBlock}>
					<h3 style={popupStyle.title}>Library</h3>
					<div style={popupStyle.libraryList}>
						{userExercises.length === 0 && (
							<span style={{ color: '#c7d1db', fontSize: '14px' }}>Empty</span>
						)}
						{userExercises.length > 0 && filteredExistingExercises.length === 0 && (
							<span style={{ color: '#c7d1db', fontSize: '14px' }}>No matches</span>
						)}
						{filteredExistingExercises.map((item) => (
							<button
								key={item._id || item.id || item.name}
								type="button"
								onClick={() => {
									setSelectedMuscleGroup(
										normalizeExerciseMuscleGroup(item.muscleGroup)
									);
									addExistingExerciseToTemplate(item, 'edit');
								}}
								style={popupStyle.libraryItem}
							>
								{item.name}
							</button>
						))}
					</div>
				</div>

				<div style={popupStyle.popupLibraryBlock}>
					<h3 style={popupStyle.title}>List</h3>
					<div style={popupStyle.libraryList}>
						{editingExercises.map((ex, i) => (
							<div key={`${ex}_${i}`}>
								<div
									style={{
										...popupStyle.ListItems,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'space-between',
									}}
								>
									<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
										<button
											type="button"
											style={{
												...popupStyle.removeExerciseButton,
												padding: '4px 8px',
											}}
											onClick={() => moveExerciseInEditingList(i, -1)}
											disabled={i === 0}
										>
											Up
										</button>
										<button
											type="button"
											style={{
												...popupStyle.removeExerciseButton,
												padding: '4px 8px',
											}}
											onClick={() => moveExerciseInEditingList(i, 1)}
											disabled={i === editingExercises.length - 1}
										>
											Down
										</button>
										<span style={popupStyle.ListItem}>{ex}</span>
									</div>
									<button
										style={popupStyle.removeExerciseButton}
										onClick={() => removeExerciseFromEditing(ex)}
									>
										Remove
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
			<div style={templatesStyles.modalButtonsHorizontal}>
				<button
					style={{ ...templatesStyles.deleteButton, ...commonStyle.popupDeleteButton }}
					onClick={deleteTemplate}
				>
					Delete
				</button>
				<button style={templatesStyles.saveButton} onClick={saveEditedTemplate}>
					Save
				</button>
			</div>
		</Popup>
	);
}
