import React, { useContext, useState } from 'react';
import { getToken } from '../../../../utils/getToken';
import { createCommonStyle } from '../../../../../styles/commonStyle';
import { createExercisesStyles } from '../../ExersicesStyles';
import { GlobalContext } from '../../../../../context/GlobalContext';

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
									Вы уверены, что хотите удалить этот вес?
								</p>

								<div style={{
									fontSize: '12px',
									color: '#666',
									textAlign: 'left',
									backgroundColor: '#f5f5f5',
									padding: '8px',
									borderRadius: '4px',
									marginTop: '10px'
								}}>
									<div><strong>ID упражнения:</strong> {exerciseId}</div>
									<div><strong>ID веса:</strong> {weightId}</div>
									<div><strong>Дата:</strong> {date}</div>
								</div>
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