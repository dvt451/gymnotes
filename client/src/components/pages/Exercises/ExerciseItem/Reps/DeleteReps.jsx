import React, { useContext, useState } from 'react';
import { getToken } from '../../../../utils/getToken';
import { createCommonStyle } from '../../../../../styles/commonStyle';
import { GlobalContext } from '../../../../../context/GlobalContext';
import Popup from '../../../../widgets/Popup';

export default function DeleteReps({
	BASE_URL,
	trainingId,
	date,
	exerciseId,
	weightId,
	setId,
	setExercises,
}) {
	const [showPopup, setShowPopup] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mainColor } = useContext(GlobalContext);
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
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${exerciseId}/weights/${weightId}/sets/${setId}`;

			const res = await fetch(url, {
				method: 'DELETE',
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Не удалось удалить подход');
			}

			setExercises(prevExercises =>
				prevExercises.map(ex => {
					if (ex._id === exerciseId) {
						return {
							...ex,
							weights: ex.weights.map(w => {
								if (w._id === weightId) {
									return {
										...w,
										sets: w.sets.filter(s => s._id !== setId),
									};
								}
								return w;
							}),
						};
					}
					return ex;
				})
			);

			setShowPopup(false);
		} catch (err) {
			console.error('Ошибка при удалении подхода:', err);
			alert(`Ошибка: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<>
			<button onClick={handleDeleteClick} style={commonStyle.deleteBtn} type="button">
				✖
			</button>

			<Popup isOpen={showPopup} onClose={() => setShowPopup(false)}>
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
									Вы уверены, что хотите удалить этот подход?
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
									<div><strong>ID подхода:</strong> {setId}</div>
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
			</Popup>
		</>
	);
}
