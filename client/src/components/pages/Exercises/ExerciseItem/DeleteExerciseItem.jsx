import React, { useContext, useState } from 'react';
import { getToken } from '../../../utils/getToken';
import { createCommonStyle } from '../../../../styles/commonStyle';
import { createExercisesStyles } from '../ExersicesStyles';
import { FaTrash } from "react-icons/fa";
import { GlobalContext } from '../../../../context/GlobalContext';
import Popup from '../../../widgets/Popup';
import { createPopupStyle } from '../../../widgets/popupStyle';

export default function DeleteExerciseItem({
	item,
	setExercises,
	date,
	trainingId,
	BASE_URL,
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
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${item._id}`;

			const res = await fetch(url, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				throw new Error('Не удалось удалить упражнение');
			}

			setExercises(prevExercises =>
				prevExercises.filter(ex => ex._id !== item._id)
			);

			setShowPopup(false);
		} catch (err) {
			console.error('Ошибка при удалении упражнения:', err);
			alert(`Ошибка: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<button
				onClick={handleDeleteClick}
				style={exercisesStyles.deleteExerciseBtn}
				type="button"
				aria-label="Удалить упражнение"
			>
				<FaTrash />
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
					<p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>
						Вы действительно хотите удалить упражнение?
					</p>
					<p style={{ margin: 0, color: '#000', fontSize: '20px' }}>
						<strong>{item.name}</strong>
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
