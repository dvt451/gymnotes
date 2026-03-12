import React, { useContext } from 'react'
import { createTemplatesStyles } from './TemplatesStyles';
import { GlobalContext } from '../../../../context/GlobalContext';
import { colors, createCommonStyle } from '../../../../styles/commonStyle';
import Popup from '../../../widgets/Popup';
import {
	handleCreateExercise,
	findExactExerciseMatch,
	normalizeExerciseName,
} from '../../exerciseLibrary/handleCreateExercise';
import { createPopupStyle } from '../../../widgets/popupStyle';
import ButtonType from '../../../widgets/ButtonType';
import { FaTrash } from 'react-icons/fa';

export default function CreateTemplatePopup({
	modalVisible,
	setModalVisible,
	newTemplateName,
	newTemplateExercises,
	setNewTemplateName,
	setNewTemplateExercises,
	newExerciseName,
	setNewExerciseName,
	userExercises,
	setTemplates,
	BASE_URL,
	trainingId,
	showNotificationMessage,
	addExistingExerciseToTemplate,
	isCreatingExercise,
	setIsCreatingExercise,
	exactMatch,
	filteredExistingExercises,
	modalError,
	setModalError
}) {
	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);
	const templatesStyles = createTemplatesStyles(mainColor);
	const popupStyle = createPopupStyle(mainColor);
	const errorStyle = {
		backgroundColor: colors.red,
		color: '#fff',
		borderRadius: '8px',
		fontSize: '14px',
	};
	// Save new template
	const saveNewTemplate = async () => {
		if (!newTemplateName.trim()) {
			alert('Enter template name');
			return;
		}

		const newTemplate = {
			name: newTemplateName.trim(),
			exercises: newTemplateExercises.map(name => ({ name })),
		};

		try {
			const token = await getToken();
			const res = await fetch(`${BASE_URL}/api/trainings/${trainingId}/templates`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(newTemplate),
			});

			if (!res.ok) {
				const text = await res.text();
				console.error('Server error saving template:', res.status, text);
				showNotificationMessage(`❌ Error saving template: ${text}`);
				return;
			}

			const saved = await res.json();
			setTemplates(prev => [...prev, saved]);
			setModalVisible(false);
			setNewTemplateName('');
			setNewTemplateExercises([]);
			showNotificationMessage('✅ Template saved successfully!');
		} catch (err) {
			console.error('Error saving template:', err);
			showNotificationMessage(`❌ Error: ${err.message}`);
		}
	};
	const addExerciseFromInput = async (mode) => {
		const normalizedInput = normalizeExerciseName(newExerciseName);
		if (!normalizedInput || isCreatingExercise) return;

		setIsCreatingExercise(true);
		setModalError('');

		try {
			const existing = findExactExerciseMatch(userExercises, normalizedInput);
			if (existing) {
				addExerciseToTemplateList(existing.name || normalizedInput, mode);
				setNewExerciseName('');
				return;

			}

			const createResult = await handleCreateExercise({
				BASE_URL,
				exerciseName: normalizedInput,
				existingExercises: userExercises,

			});

			if (!createResult.success) {
				setModalError(createResult.message || 'Не удалось создать упражнение');
				return;

			}

			const matchedExercise =
				createResult.exercise || findExactExerciseMatch(userExercises, normalizedInput);

			if (createResult.exercise) {
				setUserExercises((prev) => {
					const existsById = prev.some(
						(item) => String(item._id || item.id) === String(createResult.exercise._id || createResult.exercise.id)
					);
					if (existsById) return prev;

					return [...prev, createResult.exercise].sort((a, b) =>
						(a.name || '').localeCompare(b.name || '')
					);

				});

			}

			addExerciseToTemplateList(matchedExercise?.name || normalizedInput, mode);
			setNewExerciseName('');

		} finally {
			setIsCreatingExercise(false);

		}

	};
	// Add exercise to new template
	const addExerciseToNewTemplate = async () => {
		await addExerciseFromInput('new');
	};
	return (
		<Popup
			isOpen={modalVisible}
			onClose={() => setModalVisible(false)}
			contentStyle={{ ...templatesStyles.modalContent, ...commonStyle.popupContent }}
			contentLayerStyle={{ ...templatesStyles.modalContentLayer, ...commonStyle.popupContentLayer }}
			containerStyle={{ ...templatesStyles.modalContentContainer, ...commonStyle.popupContentContainer }}
		>
			<h3 style={popupStyle.title}>New Template</h3>

			<div style={popupStyle.popupBodyContent}>
				<input
					type="text"
					placeholder="Template name"
					value={newTemplateName}
					onChange={(e) => setNewTemplateName(e.target.value)}
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
								addExerciseToNewTemplate();
							}
						}}
						style={popupStyle.popupInput}
					/>
					<ButtonType
						addStyle={{ width: 'auto', flex: '1 1 auto', whiteSpace: 'nowrap' }}
						buttonType={7}
						functionOnClick={addExerciseToNewTemplate}
					>
						+ Exercise
					</ButtonType>
				</div>

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
								onClick={() => addExistingExerciseToTemplate(item, 'new')}
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
						{newTemplateExercises.map((ex, i) => (
							<div key={`${ex}_${i}`} style={popupStyle.ListItems}>
								<span style={popupStyle.ListItem}>{ex}</span>
								<button
									style={popupStyle.removeExerciseButton}
									onClick={() => setNewTemplateExercises((prev) => prev.filter((e) => e !== ex))}
								>
									<FaTrash />
								</button>
							</div>
						))}
					</div>
				</div>
			</div>
			<div style={templatesStyles.modalButtonsHorizontal}>
				<button
					style={{ ...templatesStyles.cancelButton, ...commonStyle.popupCancelButton }}
					onClick={() => setModalVisible(false)}
				>
					Cancel
				</button>
				<button
					style={{ ...templatesStyles.saveButton, ...commonStyle.popupCreateButton }}
					onClick={saveNewTemplate}
				>
					Save
				</button>
			</div>
		</Popup>
	)
}
