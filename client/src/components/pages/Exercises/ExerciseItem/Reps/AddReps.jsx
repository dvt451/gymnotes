import React, { useContext, useState } from 'react';
import { createCommonStyle } from '../../../../../styles/commonStyle';
import { getToken } from '../../../../utils/getToken';
import { createExercisesStyles } from '../../ExersicesStyles';
import { GlobalContext } from '../../../../../context/GlobalContext';

export default function AddReps({
	BASE_URL,
	trainingId,
	date,
	exerciseId,
	weightId,
	setExercises,
}) {
	const [showPopup, setShowPopup] = useState(false);
	const [repsInput, setRepsInput] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mainColor } = useContext(GlobalContext)

	const exercisesStyles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);

	const handleAddRepClick = () => {
		setShowPopup(true);
		setRepsInput('');
	};

	const handleCancel = () => {
		setShowPopup(false);
		setRepsInput('');
	};

	const handleSubmit = async (e) => {
		e?.preventDefault();

		if (!repsInput.trim()) return;

		const reps = parseInt(repsInput, 10);
		if (isNaN(reps) || reps <= 0) {
			alert('Введите корректное число повторений.');
			return;
		}

		setIsSubmitting(true);

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${exerciseId}/weights/${weightId}/sets`;

			const res = await fetch(url, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ reps }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || 'Не удалось добавить подход');
			}

			const newSet = await res.json();

			setExercises(prevExercises =>
				prevExercises.map(ex => {
					if (ex._id === exerciseId) {
						return {
							...ex,
							weights: ex.weights.map(w => {
								if (w._id === weightId) {
									return {
										...w,
										sets: [...w.sets, newSet],
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
			setRepsInput('');
		} catch (err) {
			console.error('Ошибка при добавлении подхода:', err);
			alert(`Ошибка: ${err.message}`);
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
			<button
				onClick={handleAddRepClick}
				style={exercisesStyles.addSetBtn}
				type="button"
			>
				+ approach
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
							<h3 style={commonStyle.title}>
								Добавить подход
							</h3>

							<div style={commonStyle.popupContentInputs}>
								<input
									type="number"
									value={repsInput}
									onChange={(e) => setRepsInput(e.target.value)}
									onKeyPress={handleKeyPress}
									placeholder="Количество повторений"
									style={commonStyle.popupInput}
									autoFocus
									min="1"
									disabled={isSubmitting}
								/>
							</div>

							<div style={commonStyle.popupButtons}>
								<button
									onClick={handleSubmit}
									style={commonStyle.popupCreateButton}
									disabled={!repsInput.trim() || isSubmitting}
								>
									{isSubmitting ? 'Добавление...' : 'Добавить'}
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