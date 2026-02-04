import React, { useState } from 'react';
import { getToken } from '../../../utils/getToken';
import { commonStyle } from '../../../../styles/commonStyle';
import exercisesStyles from '../ExersicesStyles';
import { FaTrash } from "react-icons/fa";

export default function DeleteExerciseItem({
	item,
	setExercises,
	date,
	trainingId,
	BASE_URL,
}) {
	const [showPopup, setShowPopup] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

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

			{showPopup && (
				<div style={commonStyle.popup}>
					<div
						style={commonStyle.popupLayer}
						onClick={handleCancel}
					/>
					<div style={commonStyle.popupContent}>
						<div style={commonStyle.popupContentLayer} />
						<div style={commonStyle.popupContentContainer}>
							<h3 style={{ textAlign: 'center', margin: 0, marginBottom: '15px' }}>
								Подтверждение удаления
							</h3>

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
								<p style={{ margin: 0, color: '#666' }}>
									<strong>{item.name}</strong>
								</p>
								<p style={{
									margin: '5px 0 0 0',
									fontSize: '12px',
									color: '#999'
								}}>
									ID: {item._id}
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
						</div>
					</div>
				</div>
			)}
		</>
	);
}