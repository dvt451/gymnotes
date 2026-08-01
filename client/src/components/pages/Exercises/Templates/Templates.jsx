import React, { useContext, useEffect, useState } from 'react';
import { createTemplatesStyles } from './TemplatesStyles';
import { getToken } from '../../../utils/getToken';
import { AuthContext } from '../../../../context/AuthContext';
import { colors } from '../../../../styles/commonStyle';
import { GlobalContext } from '../../../../context/GlobalContext';
import {
	filterExercisesByName,
	findExactExerciseMatch,
	normalizeExerciseName,
} from '../../exerciseLibrary/handleCreateExercise';
import CreateTemplatePopup from './CreateTemplatePopup';
import EditTemplatePopup from './EditTemplatePopup/EditTemplatePopup';
import { FaPen } from 'react-icons/fa';

export default function Templates({ setExercises, trainingId, date, existingExercises = [], setIsApplyingTemplate }) {
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
	const [notificationType, setNotificationType] = useState('success');
	const [modalError, setModalError] = useState('');
	const [isCreatingExercise, setIsCreatingExercise] = useState(false);

	const [userExercises, setUserExercises] = useState([]);
	const filteredExistingExercises = filterExercisesByName(userExercises, newExerciseName);
	const exactMatch = findExactExerciseMatch(userExercises, newExerciseName);
	const templatesStyles = createTemplatesStyles(mainColor);

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
	const showNotificationMessage = (message, type) => {
		const resolvedType = type || (/^error\b/i.test(message) ? 'error' : 'success');
		setNotificationMessage(message);
		setNotificationType(resolvedType);
		setShowNotification(true);

		setTimeout(() => {
			setShowNotification(false);
			setNotificationMessage('');
			setNotificationType('success');
		}, 3000);
	};

	// Apply template
	const applyTemplate = async (template) => {
		if (!template.exercises || !Array.isArray(template.exercises)) {
			console.warn('Template has no exercises:', template);
			return;
		}

		setIsApplyingTemplate?.(true);

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
			const exerciseNames = addedExercises.map((ex) => ex.name).join(', ');
			showNotificationMessage(
				`Added ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}: ${exerciseNames}`,
				'success'
			);

		} catch (err) {
			console.error('Error applying template:', err);
			showNotificationMessage(`Error: ${err.message}`, 'error');
		} finally {
			setIsApplyingTemplate?.(false);
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

	const openCreateModal = () => {
		setNewTemplateName('');
		setNewTemplateExercises([]);
		setNewExerciseName('');
		setModalError('');
		setModalVisible(true);
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
						Templates
					</button>
					<button
						style={{
							...templatesStyles.editButton,
							...(editState && templatesStyles.editButtonEditing)
						}}
						onClick={() => setEditState(!editState)}
					>
						{editState ? 'Editing...' : 'Edit'}
						<FaPen />
					</button>
				</div>

				{expanded && (
					<div style={templatesStyles.templateListBlock}>
						{isLoading ? (
							<div style={templatesStyles.loading}>Loading templates...</div>
						) : (
							<div style={templatesStyles.templateBody}>
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
								</div>
								<button
									style={templatesStyles.templateAddButton}
									onClick={openCreateModal}
								>
									+
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
					setUserExercises={setUserExercises}
					addExerciseToTemplateList={addExerciseToTemplateList}
				/>

				{/* Edit template modal */}
				<EditTemplatePopup
					editModalVisible={editModalVisible}
					editingTemplateName={editingTemplateName}
					newExerciseName={newExerciseName}
					exactMatch={exactMatch}
					filteredExistingExercises={filteredExistingExercises}
					editingExercises={editingExercises}
					setEditModalVisible={setEditModalVisible}
					setEditingTemplateName={setEditingTemplateName}
					setEditingExercises={setEditingExercises}
					setNewExerciseName={setNewExerciseName}
					editingTemplateId={editingTemplateId}
					modalError={modalError}
					userExercises={userExercises}
					showNotificationMessage={showNotificationMessage}
					trainingId={trainingId}
					setTemplates={setTemplates}
					addExistingExerciseToTemplate={addExistingExerciseToTemplate}
					setIsCreatingExercise={setIsCreatingExercise}
					setModalError={setModalError}
					isCreatingExercise={isCreatingExercise}
					setUserExercises={setUserExercises}
					addExerciseToTemplateList={addExerciseToTemplateList}
				/>
			</div>

			{/* Notification */}
			{showNotification && (
				<div style={{
					...templatesStyles.notification,
					...(notificationType === 'error' && templatesStyles.notificationError),
					transform: showNotification ? 'translateX(0)' : 'translateX(120%)',
				}}>
					<span style={templatesStyles.notificationIcon}>
						{notificationType === 'error' ? '❌' : '✅'}
					</span>
					<span style={templatesStyles.notificationMessage}>
						{notificationMessage}
					</span>
				</div>
			)}
		</>
	);
}
