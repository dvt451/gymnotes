import React, { useContext, useState } from 'react';
import { getToken } from '../../../../utils/getToken';
import { createCommonStyle } from '../../../../../styles/commonStyle';
import { createExercisesStyles } from '../../ExersicesStyles';
import { GlobalContext } from '../../../../../context/GlobalContext';
import Popup from '../../../../widgets/Popup';
import { createPopupStyle } from '../../../../widgets/popupStyle';

export default function AddWeight({ setExercises, itemID, trainingId, date, BASE_URL }) {
	const [showPopup, setShowPopup] = useState(false);
	const [weightInput, setWeightInput] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mainColor } = useContext(GlobalContext)
	const popupStyle = createPopupStyle(mainColor);

	const exercisesStyles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);

	const handleAddWeightClick = () => {
		setShowPopup(true);
		setWeightInput('');
	};

	const handleCancel = () => {
		setShowPopup(false);
		setWeightInput('');
	};

	const handleSubmit = async () => {
		if (!weightInput.trim()) return;

		const normalizedInput = weightInput.replace(',', '.');
		const weight = parseFloat(normalizedInput);

		if (isNaN(weight) || weight <= 0) {
			alert('Некорректный ввод веса (должно быть положительное число)');
			return;
		}

		setIsSubmitting(true);

		try {
			const token = await getToken();

			console.log('Adding weight with params:', {
				trainingId,
				date,
				exerciseId: itemID,
				weight
			});

			const res = await fetch(
				`${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${itemID}/weights`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ weight }),
				}
			);

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText || `Ошибка добавления веса (статус: ${res.status})`);
			}

			const data = await res.json();
			console.log('Weight added successfully:', data);

			// Обновляем состояние упражнений
			setExercises(prev =>
				prev.map(ex => {
					if (ex._id === itemID) {
						return {
							...ex,
							weights: [...(ex.weights || []), data]
						};
					}
					return ex;
				})
			);

			setShowPopup(false);
			setWeightInput('');

		} catch (err) {
			console.error('Ошибка при добавлении веса:', err);

			if (err.message.includes('404') || err.message.includes('не найдено')) {
				alert(`Упражнение не найдено! Проверьте:\n\n1. ID упражнения: ${itemID}\n2. ID тренировки: ${trainingId}\n3. Дата: ${date}\n\nОшибка: ${err.message}`);
			} else {
				alert(`Ошибка при добавлении веса: ${err.message}`);
			}
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleSubmit();
		}
	};

	return (
		<>
			<div>
				<button onClick={handleAddWeightClick} style={exercisesStyles.addWeightBtn}>
					+ weight
				</button>
			</div>

			<Popup isOpen={showPopup} onClose={() => setShowPopup(false)}>
				<h2 style={popupStyle.title}>Add Weight</h2>
				<div style={popupStyle.popupBodyContent}>
					<input
						type="text"
						inputMode="decimal"
						pattern="[0-9]*\.?[0-9]*"
						value={weightInput}
						onChange={(e) => setWeightInput(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Set weight (kg)"
						style={popupStyle.popupInput}
						autoFocus
						disabled={isSubmitting}
					/>
				</div>

				<div style={commonStyle.popupButtons}>
					<button
						onClick={handleSubmit}
						style={commonStyle.popupCreateButton}
						disabled={!weightInput.trim() || isSubmitting}
					>
						{isSubmitting ? 'Adding...' : 'Add'}
					</button>

					<button
						onClick={handleCancel}
						style={commonStyle.popupCancelButton}
						disabled={isSubmitting}
					>
						Cancel
					</button>
				</div>
			</Popup>
		</>
	);
}
