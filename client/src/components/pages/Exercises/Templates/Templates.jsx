import React, { useContext, useEffect, useState } from 'react';
import { createTemplatesStyles } from './TemplatesStyles';
import { getToken } from '../../../utils/getToken';
import { AuthContext } from '../../../../context/AuthContext';
import { colors, createCommonStyle } from '../../../../styles/commonStyle';
import { GlobalContext } from '../../../../context/GlobalContext';
import Popup from '../../../widgets/Popup';
import {
	handleCreateExercise,
	filterExercisesByName,
	findExactExerciseMatch,
	normalizeExerciseName,
} from '../../exerciseLibrary/handleCreateExercise';
import CreateTemplatePopup from './CreateTemplatePopup';
import { createPopupStyle } from '../../../widgets/popupStyle';
import ButtonType from '../../../widgets/ButtonType';

export default function Templates({ setExercises, trainingId, date, existingExercises = [] }) {
	const { BASE_URL } = useContext(AuthContext);
	const { mainColor } = useContext(GlobalContext);
	const [templates, setTemplates] = useState([]);
	const [modalVisible, setModalVisible] = useState(false);
	const [editModalVisible, setEditModalVisible] = useState(false);
	const [newTemplateName, setNewTemplateName] = useState('');
	const [newExerciseName, setNewExerciseName] = useState('');
	const [newTemplateExercises, setNewTemplateExercises] = useState([]);
	const [editingTemplateId, setEditingTemplateId] = useState(null);
	const [editingTemplateName, setEditingTemplateName] = useState('');
	const [editingExercises, setEditingExercises] = useState([]);
	const [expanded, setExpanded] = useState(false);
	const [editState, setEditState] = useState(false);
	const [showNotification, setShowNotification] = useState(false);
	const [notificationMessage, setNotificationMessage] = useState('');
	const [modalError, setModalError] = useState('');
	const [isCreatingExercise, setIsCreatingExercise] = useState(false);

	const [userExercises, setUserExercises] = useState([]);
	const filteredExistingExercises = filterExercisesByName(userExercises, newExerciseName);
	const exactMatch = findExactExerciseMatch(userExercises, newExerciseName);

	const commonStyle = createCommonStyle(mainColor);
	const templatesStyles = createTemplatesStyles(mainColor);
	const popupStyle = createPopupStyle(mainColor);
	const errorStyle = {
		backgroundColor: colors.red,
		color: '#fff',
		borderRadius: '8px',
		fontSize: '14px',
	};

	const addExerciseNameToList = (list, name) => {
		const normalized = normalizeExerciseName(name);
		if (!normalized) return list;

		const normalizedLower = normalized.toLowerCase();
		const exists = list.some(
			(item) => normalizeExerciseName(item).toLowerCase() === normalizedLower
		);

		if (exists) return list;
		return [...list, normalized];

	};

	const addExerciseToTemplateList = (name, mode) => {
		if (!name) return;
		if (mode === 'edit') {
			setEditingExercises((prev) => addExerciseNameToList(prev, name));

		} else {
			setNewTemplateExercises((prev) => addExerciseNameToList(prev, name));
		}
	};

	const isDuplicateInDayList = (list, exercise) => {
		const normalizedName = normalizeExerciseName(exercise?.name || '').toLowerCase();
		const normalizedLibraryId = exercise?.exerciseUserLibraryId
			? String(exercise.exerciseUserLibraryId)
			: '';

		return list.some((item) => {
			const itemLibraryId = item?.exerciseUserLibraryId ? String(item.exerciseUserLibraryId) : '';
			if (normalizedLibraryId && itemLibraryId && normalizedLibraryId === itemLibraryId) {
				return true;
			}

			const itemName = normalizeExerciseName(item?.name || '').toLowerCase();
			return Boolean(normalizedName && itemName && itemName === normalizedName);
		});
	};

	const addExistingExerciseToTemplate = (exercise, mode) => {
		if (!exercise || isCreatingExercise) return;
		setModalError('');
		addExerciseToTemplateList(exercise.name || '', mode);
		setNewExerciseName('');
	};



	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				const token = await getToken();
				console.log('Fetching templates for trainingId (fileId):', trainingId);
				// Изменяем URL на правильный
				const res = await fetch(`${BASE_URL}/api/trainings/${trainingId}/templates`, {

					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) {
					if (res.status === 404) {
						console.error(`Templates not found for trainingId (fileId): ${trainingId}`);
						setTemplates([]);
						return;
					}
					throw new Error(`HTTP error! status: ${res.status}`);
				}

				const data = await res.json();
				console.log('Templates data:', data);
				const safeTemplates = Array.isArray(data) ? data : [];
				const normalized = safeTemplates.map(t => ({
					...t,
					exercises: Array.isArray(t.exercises) ? t.exercises : [],
				}));
				setTemplates(normalized);
			} catch (err) {
				console.error('Error loading templates:', err);
				setTemplates([]);
			}
		};

		if (trainingId) {
			fetchTemplates();
		}
	}, [trainingId, BASE_URL]);

	useEffect(() => {
		const loadUserLibrary = async () => {
			try {
				const token = getToken();
				if (!token) return;

				const response = await fetch(`${BASE_URL}/api/exercise-library`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) return;
				const data = await response.json();
				setUserExercises(Array.isArray(data.userExercises) ? data.userExercises : []);
			} catch (err) {
				console.error('РћС€РёР±РєР° Р·Р°РіСЂСѓР·РєРё Р±РёР±Р»РёРѕС‚РµРєРё СѓРїСЂР°Р¶РЅРµРЅРёР№:', err);
			}
		};

		loadUserLibrary();
	}, [BASE_URL]);

	// Show notification
	const showNotificationMessage = (message) => {
		setNotificationMessage(message);
		setShowNotification(true);

		setTimeout(() => {
			setShowNotification(false);
			setNotificationMessage('');
		}, 3000);
	};

	// Apply template
	const applyTemplate = async (template) => {
		if (!template.exercises || !Array.isArray(template.exercises)) {
			console.warn('Template has no exercises:', template);
			return;
		}

		try {
			const exercisesToAdd = template.exercises.filter(
				(exercise) => !isDuplicateInDayList(existingExercises, exercise)
			);

			if (exercisesToAdd.length === 0) {
				showNotificationMessage('No new exercises to add');
				return;
			}

			const token = await getToken();
			const res = await fetch(`${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/apply-template`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({ exercises: exercisesToAdd }),
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Error applying template');
			}

			const addedExercises = await res.json();
			setExercises((prev) => {
				const next = [...prev];
				addedExercises.forEach((exercise) => {
					if (!isDuplicateInDayList(next, exercise)) {
						next.push(exercise);
					}
				});
				return next;
			});

			const exerciseCount = addedExercises.length;
			const exerciseNames = addedExercises.map(ex => ex.name).join(', ');
			showNotificationMessage(`✅ Added ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}: ${exerciseNames}`);

		} catch (err) {
			console.error('Error applying template:', err);
			showNotificationMessage(`❌ Error: ${err.message}`);
		}
	};



	// Save edited template
	const saveEditedTemplate = async () => {
		if (!editingTemplateName.trim()) {
			alert('Enter template name');
			return;
		}

		const updated = {
			name: editingTemplateName.trim(),
			exercises: editingExercises.map(name => ({ name })),
		};

		try {
			const token = await getToken();
			const res = await fetch(`${BASE_URL}/api/trainings/${trainingId}/templates/${editingTemplateId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(updated),
			});

			if (!res.ok) {
				const text = await res.text();
				console.error('Server error editing template:', res.status, text);
				showNotificationMessage(`❌ Error updating template: ${text}`);
				return;
			}

			const updatedTemplate = await res.json();
			setTemplates(prev =>
				prev.map(t => t._id === updatedTemplate._id ? updatedTemplate : t)
			);

			setEditModalVisible(false);
			showNotificationMessage('✅ Template updated successfully!');
		} catch (err) {
			console.error('Error editing template:', err);
			showNotificationMessage(`❌ Error: ${err.message}`);
		}
	};

	const deleteTemplate = async () => {
		if (!window.confirm('Delete template? This action cannot be undone.')) return;

		try {
			const token = await getToken();
			const res = await fetch(`${BASE_URL}/api/trainings/${trainingId}/templates/${editingTemplateId}`, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				const text = await res.text();
				console.error('Server error deleting template:', res.status, text);
				showNotificationMessage(`❌ Error deleting template: ${text}`);
				return;
			}

			setTemplates(prev => prev.filter(t => t._id !== editingTemplateId));
			setEditModalVisible(false);
			showNotificationMessage('🗑️ Template deleted');
		} catch (err) {
			console.error('Error deleting template:', err);
			showNotificationMessage(`❌ Error: ${err.message}`);
		}
	};



	// Open edit template modal
	const openEditModal = (template) => {
		setEditingTemplateId(template._id);
		setEditingTemplateName(template.name);
		setEditingExercises(template.exercises.map(e => e.name));
		setNewExerciseName('');
		setModalError('');
		setEditModalVisible(true);
	};

	// Remove exercise from editing template
	const removeExerciseFromEditing = (name) => {
		setEditingExercises((prev) => prev.filter((ex) => ex !== name));
	};

	// Add new exercise to editing template
	const addExerciseToEditing = async () => {
		await addExerciseFromInput('edit');
	};

	const openCreateModal = () => {
		setNewTemplateName('');
		setNewTemplateExercises([]);
		setNewExerciseName('');
		setModalError('');
		setModalVisible(true);
	};

	// Notification styles
	const notificationStyles = {
		notification: {
			position: 'fixed',
			top: '80px',
			right: '20px',
			backgroundColor: '#4CAF50',
			color: 'white',
			padding: '15px 20px',
			borderRadius: '8px',
			boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
			zIndex: 9999,
			maxWidth: '400px',
			transform: showNotification ? 'translateX(0)' : 'translateX(120%)',
			transition: 'transform 0.3s ease-in-out',
			display: 'flex',
			alignItems: 'center',
			gap: '10px',
		},
		notificationError: {
			backgroundColor: '#f44336',
		},
		notificationIcon: {
			fontSize: '20px',
		},
		notificationMessage: {
			fontSize: '14px',
			fontWeight: '500',
		}
	};

	// Проверяем, доступны ли шаблоны
	const isLoading = templates === null;

	return (
		<>
			<div style={templatesStyles.container}>
				<div style={templatesStyles.header}>
					<button
						style={templatesStyles.title}
						onClick={() => setExpanded(!expanded)}
					>
						📋 Templates
					</button>
					<button
						style={{
							...templatesStyles.editButton,
							...(editState && templatesStyles.editButtonEditing)
						}}
						onClick={() => setEditState(!editState)}
					>
						{editState ? 'Editing...' : 'Edit'}
					</button>
				</div>

				{expanded && (
					<div style={templatesStyles.templateListBlock}>
						{isLoading ? (
							<div style={templatesStyles.loading}>Loading templates...</div>
						) : (
							<div style={templatesStyles.templateList}>
								{templates.map((item) => (
									<div key={item._id}>
										<button
											style={{
												...templatesStyles.templateItem,
												...(editState && templatesStyles.templateItemEditing)
											}}
											onClick={() => editState ? openEditModal(item) : applyTemplate(item)}
										>
											{item.name}
										</button>
									</div>
								))}
								<button
									style={templatesStyles.templateAddButton}
									onClick={openCreateModal}
								>
									+ Add Template
								</button>
							</div>
						)}
					</div>
				)}

				{/* Create template popup */}
				<CreateTemplatePopup
					modalVisible={modalVisible}
					setModalVisible={setModalVisible}
					newTemplateName={newTemplateName}
					setNewTemplateName={setNewTemplateName}
					newTemplateExercises={newTemplateExercises}
					setNewTemplateExercises={setNewTemplateExercises}
					newExerciseName={newExerciseName}
					setNewExerciseName={setNewExerciseName}
					userExercises={userExercises}
					BASE_URL={BASE_URL}
					setTemplates={setTemplates}
					showNotificationMessage={showNotificationMessage}
					trainingId={trainingId}
					addExistingExerciseToTemplate={addExistingExerciseToTemplate}
					isCreatingExercise={isCreatingExercise}
					setIsCreatingExercise={setIsCreatingExercise}
					exactMatch={exactMatch}
					modalError={modalError}
					setModalError={setModalError}
					filteredExistingExercises={filteredExistingExercises}
				/>

				{/* Edit template modal */}
				<Popup
					isOpen={editModalVisible}
					onClose={() => setEditModalVisible(false)}
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
										onClick={() => addExistingExerciseToTemplate(item, 'edit')}
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
									<div key={`${ex}_${i}`} style={popupStyle.ListItems}>
										<span style={popupStyle.ListItem}>{ex}</span>
										<button
											style={popupStyle.removeExerciseButton}
											onClick={() => removeExerciseFromEditing(ex)}
										>
											✖
										</button>
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
						<button
							style={templatesStyles.saveButton}
							onClick={saveEditedTemplate}
						>
							Save
						</button>
					</div>
				</Popup>
			</div>

			{/* Notification */}
			{showNotification && (
				<div style={{
					...notificationStyles.notification,
					...(notificationMessage.includes('❌') && notificationStyles.notificationError)
				}}>
					<span style={notificationStyles.notificationIcon}>
						{notificationMessage.includes('✅') ? '✅' : notificationMessage.includes('🗑️') ? '🗑️' : '❌'}
					</span>
					<span style={notificationStyles.notificationMessage}>
						{notificationMessage.replace(/[✅🗑️❌]/g, '').trim()}
					</span>
				</div>
			)}
		</>
	);
}
