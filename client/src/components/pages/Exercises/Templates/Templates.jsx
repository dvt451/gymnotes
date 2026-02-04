import React, { useContext, useEffect, useState } from 'react';
import { templatesStyles } from './TemplatesStyles';
import { getToken } from '../../../utils/getToken';
import { AuthContext } from '../../../../context/AuthContext';
import { commonStyle } from '../../../../styles/commonStyle';

export default function Templates({ setExercises, trainingId, date }) {
	const { BASE_URL } = useContext(AuthContext);

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

	useEffect(() => {
		const fetchTemplates = async () => {
			try {
				const token = await getToken();
				const res = await fetch(`${BASE_URL}/api/trainings/${trainingId}/templates`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				const templates = await res.json();
				const safeTemplates = Array.isArray(templates) ? templates : [];
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
		fetchTemplates();
	}, [trainingId]);

	// Show notification
	const showNotificationMessage = (message) => {
		setNotificationMessage(message);
		setShowNotification(true);

		// Hide notification after 3 seconds
		setTimeout(() => {
			setShowNotification(false);
			setNotificationMessage('');
		}, 3000);
	};

	// Apply template - add exercises with empty weights and sets
	const applyTemplate = async (template) => {
		if (!template.exercises || !Array.isArray(template.exercises)) {
			console.warn('Template has no exercises:', template);
			return;
		}

		try {
			const token = await getToken();
			const res = await fetch(`${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/apply-template`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({ exercises: template.exercises }),
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(text || 'Error applying template');
			}

			const addedExercises = await res.json();
			setExercises(prev => [...prev, ...addedExercises]);

			// Show success notification
			const exerciseCount = addedExercises.length;
			const exerciseNames = addedExercises.map(ex => ex.name).join(', ');
			showNotificationMessage(`✅ Added ${exerciseCount} exercise${exerciseCount !== 1 ? 's' : ''}: ${exerciseNames}`);

		} catch (err) {
			console.error('Error applying template:', err);
			showNotificationMessage(`❌ Error: ${err.message}`);
		}
	};

	// Open create template modal
	const openCreateModal = () => {
		setNewTemplateName('');
		setNewTemplateExercises([]);
		setModalVisible(true);
	};

	// Add exercise to new template
	const addExerciseToNewTemplate = () => {
		const trimmed = newExerciseName.trim();
		if (trimmed && !newTemplateExercises.includes(trimmed)) {
			setNewTemplateExercises([...newTemplateExercises, trimmed]);
			setNewExerciseName('');
		}
	};

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

	// Open edit template modal
	const openEditModal = (template) => {
		setEditingTemplateId(template._id);
		setEditingTemplateName(template.name);
		setEditingExercises(template.exercises.map(e => e.name));
		setEditModalVisible(true);
	};

	// Remove exercise from editing template
	const removeExerciseFromEditing = (name) => {
		setEditingExercises((prev) => prev.filter((ex) => ex !== name));
	};

	// Add new exercise to editing template
	const addExerciseToEditing = () => {
		const trimmed = newExerciseName.trim();
		if (trimmed && !editingExercises.includes(trimmed)) {
			setEditingExercises([...editingExercises, trimmed]);
			setNewExerciseName('');
		}
	};

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

	// Add styles for notification
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
					</div>
				)}

				{/* Create template modal */}
				{modalVisible && (
					<div style={templatesStyles.modalOverlay} onClick={() => setModalVisible(false)}>
						<div style={templatesStyles.modalLayer} />
						<div style={templatesStyles.modalContent} onClick={(e) => e.stopPropagation()}>
							<div style={templatesStyles.modalContentLayer} />
							<div style={templatesStyles.modalContentContainer}>
								<h3 style={commonStyle.title}>New Template</h3>

								<input
									type="text"
									placeholder="Template name"
									value={newTemplateName}
									onChange={(e) => setNewTemplateName(e.target.value)}
									style={templatesStyles.input}
								/>

								<div style={templatesStyles.exerciseInputRow}>
									<input
										type="text"
										placeholder="Add exercise"
										value={newExerciseName}
										onChange={(e) => setNewExerciseName(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && addExerciseToNewTemplate()}
										style={templatesStyles.exerciseInput}
									/>
									<button
										style={templatesStyles.addExerciseButton}
										onClick={addExerciseToNewTemplate}
									>
										➕
									</button>
								</div>

								<div style={templatesStyles.exerciseList}>
									{newTemplateExercises.map((ex, i) => (
										<div key={`${ex}_${i}`} style={templatesStyles.exerciseItem}>
											<span style={templatesStyles.exerciseName}>{ex}</span>
											<button
												style={templatesStyles.removeExerciseButton}
												onClick={() => setNewTemplateExercises((prev) => prev.filter((e) => e !== ex))}
											>
												✖
											</button>
										</div>
									))}
								</div>

								<div style={templatesStyles.modalButtonsHorizontal}>
									<button
										style={templatesStyles.cancelButton}
										onClick={() => setModalVisible(false)}
									>
										Cancel
									</button>
									<button
										style={templatesStyles.saveButton}
										onClick={saveNewTemplate}
									>
										Save
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{/* Edit template modal */}
				{editModalVisible && (
					<div style={templatesStyles.modalOverlay} onClick={() => setEditModalVisible(false)}>
						<div style={templatesStyles.modalLayer} />
						<div style={templatesStyles.modalContent} onClick={(e) => e.stopPropagation()}>
							<div style={templatesStyles.modalContentLayer} />
							<div style={templatesStyles.modalContentContainer}>
								<h3 style={templatesStyles.modalTitle}>Edit Template</h3>

								<input
									type="text"
									placeholder="Template name"
									value={editingTemplateName}
									onChange={(e) => setEditingTemplateName(e.target.value)}
									style={templatesStyles.input}
								/>

								<div style={templatesStyles.exerciseInputRow}>
									<input
										type="text"
										placeholder="Add exercise"
										value={newExerciseName}
										onChange={(e) => setNewExerciseName(e.target.value)}
										onKeyDown={(e) => e.key === 'Enter' && addExerciseToEditing()}
										style={templatesStyles.exerciseInput}
									/>
									<button
										style={templatesStyles.addExerciseButton}
										onClick={addExerciseToEditing}
									>
										➕
									</button>
								</div>

								<div style={templatesStyles.exerciseList}>
									{editingExercises.map((ex, i) => (
										<div key={`${ex}_${i}`} style={templatesStyles.exerciseItem}>
											<span style={templatesStyles.exerciseName}>{ex}</span>
											<button
												style={templatesStyles.removeExerciseButton}
												onClick={() => removeExerciseFromEditing(ex)}
											>
												✖
											</button>
										</div>
									))}
								</div>

								<div style={templatesStyles.modalButtonsHorizontal}>
									<button
										style={templatesStyles.deleteButton}
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
							</div>
						</div>
					</div>
				)}
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