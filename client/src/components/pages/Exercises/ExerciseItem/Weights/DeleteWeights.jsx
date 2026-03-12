import React, { useContext, useState } from 'react';
import { getToken } from '../../../../utils/getToken';
import { createCommonStyle } from '../../../../../styles/commonStyle';
import { createExercisesStyles } from '../../ExersicesStyles';
import { GlobalContext } from '../../../../../context/GlobalContext';
import Popup from '../../../../widgets/Popup';
import { createPopupStyle } from '../../../../widgets/popupStyle';

export default function DeleteWeights({
	BASE_URL,
	trainingId,
	date,
	exerciseId,
	weightId,
	setExercises,
}) {
	const [showPopup, setShowPopup] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mainColor } = useContext(GlobalContext)
	const popupStyle = createPopupStyle(mainColor);

	const exercisesStyles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);

	const handleDeleteClick = () => {
		setShowPopup(true);
	};

	const handleCancel = () => {
		setShowPopup(false);
	};

	const handleDelete = async () => {
		setIsSubmitting(true);

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${exerciseId}/weights/${weightId}`;

			const res = await fetch(url, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Не удалось удалить вес');
			}

			// Обновить состояние после удаления
			setExercises(prevExercises =>
				prevExercises.map(ex => {
					if (ex._id === exerciseId) {
						return {
							...ex,
							weights: ex.weights.filter(w => w._id !== weightId),
						};
					}
					return ex;
				})
			);

			setShowPopup(false);
		} catch (err) {
			console.error('Ошибка при удалении веса:', err);
			alert(`Ошибка: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<button
				onClick={handleDeleteClick}
				style={exercisesStyles.deleteWeightBtn}
				type="button"
				aria-label="Удалить вес"
			>
				-
			</button>

			<Popup isOpen={showPopup} onClose={() => setShowPopup(false)}>
				<h2 style={popupStyle.title}>Подтверждение удаления</h2>

				<div style={{
					textAlign: 'center',
					marginBottom: '20px',
					padding: '10px',
					backgroundColor: '#fff9f9',
					borderRadius: '5px',
					border: '1px solid #ffcccc'
				}}>
					<p style={{ fontWeight: 'bold' }}>
						Вы уверены, что хотите удалить этот вес?
					</p>
				</div>

				<div style={commonStyle.popupButtons}>
					<button
						onClick={handleDelete}
						style={{
							...commonStyle.popupDeleteButton,
							opacity: isSubmitting ? 0.7 : 1
						}}
						disabled={isSubmitting}
					>
						{isSubmitting ? 'Удаление...' : 'Удалить'}
					</button>

					<button
						onClick={handleCancel}
						style={commonStyle.popupCancelButton}
						disabled={isSubmitting}
					>
						Отмена
					</button>
				</div>
			</Popup>
		</>
	);
}
