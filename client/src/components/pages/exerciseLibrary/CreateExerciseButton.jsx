import React, { useContext, useState } from 'react';
import { createExercisesStyles } from './ExersicesStyles';
import { GlobalContext } from '../../../context/GlobalContext';
import { colors, createCommonStyle } from '../../../styles/commonStyle';
import {
	filterExercisesByName,
	findExactExerciseMatch,
} from './handleCreateExercise';

export default function CreateExerciseButton({ existingExercises = [], onCreateExercise }) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);
	const [modalVisible, setModalVisible] = useState(false);
	const [newExerciseName, setNewExerciseName] = useState('');
	const [errorMessage, setErrorMessage] = useState('');
	const [isSaving, setIsSaving] = useState(false);

	const exactMatch = findExactExerciseMatch(existingExercises, newExerciseName);
	const duplicatedName = exactMatch?.name;
	const filteredExercises = filterExercisesByName(existingExercises, newExerciseName);

	const addExercise = async () => {
		if (!newExerciseName.trim()) return;
		if (typeof onCreateExercise !== 'function') return;

		setIsSaving(true);
		setErrorMessage('');

		try {
			const result = await onCreateExercise(newExerciseName);
			if (!result?.success) {
				setErrorMessage(result?.message || 'Не удалось создать упражнение');
				return;
			}

			setNewExerciseName('');
			setModalVisible(false);
		} catch (err) {
			setErrorMessage(err.message || 'Не удалось создать упражнение');
		} finally {
			setIsSaving(false);
		}
	};

	const handleOpenModal = () => {
		setErrorMessage('');
		setModalVisible(true);
	};

	return (
		<>
			<button style={styles.addButton} onClick={handleOpenModal}>
				<span>+</span>
				<span>Add Exercise</span>
			</button>
			{modalVisible && (
				<div style={commonStyle.popup} onClick={() => setModalVisible(false)}>
					<div style={commonStyle.popupLayer} />
					<div style={commonStyle.popupContent} onClick={(e) => e.stopPropagation()}>
						<div style={commonStyle.popupContentLayer} />
						<div style={commonStyle.popupContentContainer}>
							<h2 style={{ textAlign: 'center', margin: '0 0 15px 0' }}>Новое упражнение</h2>

							<div style={commonStyle.popupContentInputs}>
								<input
									type="text"
									style={commonStyle.popupInput}
									placeholder="Название упражнения"
									value={newExerciseName}
									onChange={(e) => setNewExerciseName(e.target.value)}
									autoFocus
								/>
							</div>

							{duplicatedName && (
								<p style={{ ...styles.error, margin: '0 0 12px 0', padding: '10px' }}>
									Упражнение уже существует: {duplicatedName}
								</p>
							)}

							{errorMessage && (
								<p style={{ ...styles.error, margin: '0 0 12px 0', padding: '10px' }}>
									{errorMessage}
								</p>
							)}

							<div style={{ marginBottom: '12px', backgroundColor: colors.blueDark, borderRadius: '8px', padding: '12px' }}>
								<h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>Существующие упражнения</h4>
								<div
									style={{
										maxHeight: '140px',
										overflowY: 'auto',
										display: 'flex',
										flexDirection: 'column',
										gap: '6px',
										padding: '8px',
										borderRadius: '8px',
									}}
								>
									{existingExercises.length === 0 && (
										<span style={{ color: '#c7d1db', fontSize: '14px' }}>Пока пусто</span>
									)}
									{existingExercises.length > 0 && filteredExercises.length === 0 && (
										<span style={{ color: '#c7d1db', fontSize: '14px' }}>Совпадений не найдено</span>
									)}
									{filteredExercises.map((item) => (
										<button
											key={item._id || item.id || item.name}
											type="button"
											onClick={() => {
												setErrorMessage('');
												setNewExerciseName(item.name || '');
											}}
											style={{
												textAlign: 'left',
												padding: '6px 8px',
												borderRadius: '6px',
												border: '1px solid rgba(255,255,255,0.1)',
												background: colors.labelBG,
												color: '#fff',
												cursor: 'pointer',
											}}
										>
											{item.name}
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
									{isSaving ? 'Сохранение...' : 'Сохранить'}
								</button>
								<button
									style={commonStyle.popupCancelButton}
									onClick={() => {
										setModalVisible(false);
										setErrorMessage('');
									}}
									disabled={isSaving}
								>
									Отмена
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	);
}
