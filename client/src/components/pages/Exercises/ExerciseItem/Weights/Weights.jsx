import React, { useContext, useState } from 'react';
import { createExercisesStyles } from '../../ExersicesStyles';
import AddWeight from './AddWeight';
import DeleteWeights from './DeleteWeights';
import Repeats from '../Reps/Repeats';
import { colors, createCommonStyle } from '../../../../../styles/commonStyle';
import Popup from '../../../../widgets/Popup';
import { getToken } from '../../../../utils/getToken';
import { GlobalContext } from '../../../../../context/GlobalContext';
import { createPopupStyle } from '../../../../widgets/popupStyle';

export default function Weights({ item, editState, setExercises, date, trainingId, isExpanded, BASE_URL }) {
	const [showEditPopup, setShowEditPopup] = useState(false);
	const [currentWeight, setCurrentWeight] = useState(null);
	const [newWeightInput, setNewWeightInput] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mainColor } = useContext(GlobalContext)
	const popupStyle = createPopupStyle(mainColor);

	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);


	const weightChangeHandler = (weight) => {
		// Сохраняем текущий вес и открываем popup
		setCurrentWeight(weight);
		setNewWeightInput(weight.weight.toString());
		setShowEditPopup(true);
	};

	const handleEditCancel = () => {
		setShowEditPopup(false);
		setCurrentWeight(null);
		setNewWeightInput('');
	};

	const handleEditSubmit = async () => {
		if (!newWeightInput.trim() || !currentWeight) return;

		const normalizedInput = newWeightInput.replace(',', '.');
		const newWeightValue = parseFloat(normalizedInput);

		if (isNaN(newWeightValue) || newWeightValue <= 0) {
			alert('Введите корректный вес (положительное число)');
			return;
		}

		setIsSubmitting(true);

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${item._id}/weights/${currentWeight._id}`;

			const res = await fetch(url, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ weight: newWeightValue }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Не удалось изменить вес');

			// Обновляем состояние с измененным весом
			setExercises(prevExercises =>
				prevExercises.map(ex => {
					if (ex._id === item._id) {
						return {
							...ex,
							weights: ex.weights.map(w => {
								if (w._id === currentWeight._id) {
									return { ...w, weight: newWeightValue };
								}
								return w;
							}),
						};
					}
					return ex;
				})
			);

			setShowEditPopup(false);
			setCurrentWeight(null);
			setNewWeightInput('');
		} catch (err) {
			console.error('Ошибка при изменении веса:', err);
			alert(`Ошибка: ${err.message}`);
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
			<div style={styles.settingsRow}>
				{(!item.weights || item.weights.length === 0) && (
					<p style={styles.noWeights}>Нет весов</p>
				)}

				{item.weights && item.weights.map((w) => (
					<div key={w._id} style={styles.weightBlock}>
						<button
							style={{
								...styles.weightButton,
								...(editState && isExpanded && {
									cursor: 'pointer',
									position: 'relative',
								})
							}}
							onClick={() => editState && isExpanded ? weightChangeHandler(w) : null}
							title={editState && isExpanded ? "Нажмите для редактирования веса" : ""}
						>
							<span style={{
								...styles.weightText,
								...(editState && isExpanded && {
									backgroundColor: colors.blueLight,
									padding: '0 4px',
									borderRadius: '4px',
									color: colors.black,
									transition: 'all 0.2s ease',
								})
							}}>
								{w.weight}kg
							</span>
						</button>
						<Repeats
							editState={editState}
							BASE_URL={BASE_URL}
							trainingId={trainingId}
							date={date}
							item={item}
							w={w}
							isExpanded={isExpanded}
							setExercises={setExercises}
						/>
						{editState && isExpanded && <DeleteWeights
							BASE_URL={BASE_URL}
							trainingId={trainingId}
							date={date}
							exerciseId={item._id}
							weightId={w._id}
							setExercises={setExercises}
						/>}
					</div>
				))}

				{!editState && isExpanded && <AddWeight
					BASE_URL={BASE_URL}
					date={date}
					trainingId={trainingId}
					setExercises={setExercises}
					itemID={item._id}
				/>}
			</div>

			{/* Popup для редактирования веса */}
			{showEditPopup && currentWeight && (
				<Popup isOpen onClose={handleEditCancel}>
					<h2 style={popupStyle.title}>Изменить вес</h2>
					<div style={commonStyle.popupContentInputs}>
						<input
							type="number"
							step="0.1"
							min="1"
							value={newWeightInput}
							onChange={(e) => setNewWeightInput(e.target.value)}
							onKeyPress={handleKeyPress}
							placeholder="Введите новый вес"
							style={popupStyle.popupInput}
							autoFocus
							disabled={isSubmitting}
						/>
					</div>

					<div style={commonStyle.popupButtons}>
						<button
							onClick={handleEditSubmit}
							style={{
								...commonStyle.popupCreateButton,
								opacity: isSubmitting ? 0.7 : 1
							}}
							disabled={!newWeightInput.trim() || isSubmitting}
						>
							{isSubmitting ? 'Сохранение...' : 'Сохранить'}
						</button>

						<button
							onClick={handleEditCancel}
							style={commonStyle.popupCancelButton}
							disabled={isSubmitting}
						>
							Отмена
						</button>
					</div>
				</Popup>
			)}
		</>
	);
}
