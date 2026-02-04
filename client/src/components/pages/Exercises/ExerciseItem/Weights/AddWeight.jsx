import React, { useState } from 'react';
import { getToken } from '../../../../utils/getToken';
import { commonStyle } from '../../../../../styles/commonStyle';
import exercisesStyles from '../../ExersicesStyles';

export default function AddWeight({ setExercises, itemID, trainingId, date, BASE_URL }) {
	const [showPopup, setShowPopup] = useState(false);
	const [weightInput, setWeightInput] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

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

		if (isNaN(weight)) {
			alert('Некорректный ввод веса');
			return;
		}

		setIsSubmitting(true);

		try {
			const token = await getToken();

			// Используем itemID вместо exerciseId
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

			const data = await res.json();

			if (!res.ok) {
				// Более подробное сообщение об ошибке
				console.error('Server error details:', data);
				throw new Error(data.message || `Ошибка добавления веса (статус: ${res.status})`);
			}

			// Обновляем состояние упражнений
			setExercises(prev =>
				prev.map(ex =>
					ex._id === itemID ? { ...ex, weights: [...(ex.weights || []), data] } : ex
				)
			);

			setShowPopup(false);
			setWeightInput('');

		} catch (err) {
			console.error('Полная ошибка при добавлении веса:', err);

			// Более информативное сообщение
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

	// Для отладки
	console.log('AddWeight component props:', {
		itemID,
		trainingId,
		date,
		BASE_URL
	});

	return (
		<>
			<button onClick={handleAddWeightClick} style={exercisesStyles.addWeightBtn}>
				+ weight
			</button>

			{showPopup && (
				<div style={commonStyle.popup}>
					<div
						style={commonStyle.popupLayer}
						onClick={handleCancel}
					/>
					<div style={commonStyle.popupContent}>
						<div style={commonStyle.popupContentLayer} />
						<div style={commonStyle.popupContentContainer}>
							<h3 style={{ textAlign: 'center', margin: 0 }}>
								Add Weight
							</h3>

							<div style={commonStyle.popupContentInputs}>
								<input
									type="number"
									step="0.1"
									min="0"
									value={weightInput}
									onChange={(e) => setWeightInput(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder="Set weight (kg)"
									style={commonStyle.popupInput}
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
						</div>
					</div>
				</div>
			)}
		</>
	);
}