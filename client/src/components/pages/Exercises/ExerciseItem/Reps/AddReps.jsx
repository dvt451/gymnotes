import React, { useContext, useState } from 'react';
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
	const [repsInput, setRepsInput] = useState('');
	const [addIsSubmitting, setAddIsSubmitting] = useState(false);
	const [showInput, setShowInput] = useState(false);
	const { mainColor } = useContext(GlobalContext);

	const exercisesStyles = createExercisesStyles(mainColor);

	const handleAddRepClick = () => {
		setShowInput(true);
		setRepsInput('');
	};

	const handleCancel = () => {
		setShowInput(false);
		setRepsInput('');
	};

	const handleSubmit = async () => {
		if (!repsInput.trim()) return;

		const reps = parseInt(repsInput, 10);
		if (isNaN(reps) || reps <= 0) {
			alert('Введите корректное число повторений.');
			return;
		}

		setAddIsSubmitting(true);

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
			const repsValue = Number.isFinite(Number(newSet?.reps)) ? Number(newSet.reps) : reps;

			setExercises(prevExercises =>
				prevExercises.map(ex => {
					if (ex._id === exerciseId) {
						return {
							...ex,
							weights: ex.weights.map(w => {
								if (w._id === weightId) {
									return {
										...w,
										sets: [...w.sets, repsValue],
									};
								}
								return w;
							}),
						};
					}
					return ex;
				})
			);

			setShowInput(false);
			setRepsInput('');
		} catch (err) {
			console.error('Ошибка при добавлении подхода:', err);
			alert(`Ошибка: ${err.message}`);
		} finally {
			setAddIsSubmitting(false);
		}
	};

	return (
		<>
			{!showInput ? (
				<button
					onClick={handleAddRepClick}
					style={exercisesStyles.addSetBtn}
					type="button"
				>
					+ approach
				</button>
			) : (
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
					<input
						type="text"
						inputMode="decimal"
						pattern="[0-9]*\.?[0-9]*"
						value={repsInput}
						onChange={(e) => setRepsInput(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Повторения"
						style={{
							padding: '6px 10px',
							borderRadius: '8px',
							border: `1px solid ${mainColor}`,
							fontSize: '14px',
							width: '70px',
							textAlign: 'center',
						}}
						autoFocus
						min="1"
						disabled={addIsSubmitting}
					/>
					<button
						onClick={handleSubmit}
						style={{
							...exercisesStyles.addSetBtn,
							padding: '6px 12px',
							margin: 0,
							backgroundColor: mainColor,
							color: 'white',
						}}
						disabled={!repsInput.trim() || addIsSubmitting}
					>
						{addIsSubmitting ? '...' : 'OK'}
					</button>
					<button
						onClick={handleCancel}
						style={{
							padding: '6px 10px',
							backgroundColor: '#ccc',
							border: 'none',
							borderRadius: '8px',
							cursor: 'pointer',
							fontSize: '14px',
						}}
						disabled={addIsSubmitting}
					>
						✕
					</button>
				</div>
			)}
		</>
	);
}