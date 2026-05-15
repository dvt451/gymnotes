import React, { useContext, useState } from 'react';
import { getToken } from '../../../../utils/getToken';
import { createExercisesStyles } from '../../ExersicesStyles';
import { GlobalContext } from '../../../../../context/GlobalContext';
import { colors } from '../../../../../styles/commonStyle';
import InlineSpinner from '../../../../widgets/InlineSpinner';

export default function AddWeight({ setExercises, itemID, trainingId, date, BASE_URL }) {
	const [showInput, setShowInput] = useState(false);
	const [weightInput, setWeightInput] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mainColor } = useContext(GlobalContext);

	const exercisesStyles = createExercisesStyles(mainColor);

	const handleAddClick = () => {
		setShowInput(true);
		setWeightInput('');
	};

	const handleAddWeight = async () => {
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

			setShowInput(false);
			setWeightInput('');

		} catch (err) {
			console.error('Ошибка при добавлении веса:', err);
			alert(`Ошибка при добавлении веса: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setShowInput(false);
		setWeightInput('');
	};

	const handleKeyPress = (e) => {
		if (e.key === 'Enter') {
			handleAddWeight();
		}
	};

	return (
		<div>
			{!showInput ? (
				<button onClick={handleAddClick} style={exercisesStyles.addWeightBtn}>
					+ weight
				</button>
			) : (
				<div style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: '10px' }}>
					<input
						type="text"
						inputMode="decimal"
						value={weightInput}
						onChange={(e) => setWeightInput(e.target.value)}
						onKeyPress={handleKeyPress}
						placeholder="Вес в кг"
						style={{
							padding: '8px 12px',
							borderRadius: '8px',
							border: `1px solid ${mainColor}`,
							fontSize: '14px',
							width: '100px',
							color: colors.blueDark,
						}}
						onBlur={handleAddWeight}
						disabled={isSubmitting}
						autoFocus
					/>
					<button
						onClick={handleAddWeight}
						style={{
							...exercisesStyles.addWeightBtn,
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '8px',
							padding: '8px 16px',
							margin: 0,
						}}
						disabled={!weightInput.trim() || isSubmitting}
					>
						{isSubmitting ? (
							<>
								<InlineSpinner size={14} thickness={2} color={colors.white} />
								<span>Saving</span>
							</>
						) : 'OK'}
					</button>
					<button
						onClick={handleCancel}
						style={{
							padding: '8px 12px',
							backgroundColor: '#ccc',
							border: 'none',
							borderRadius: '8px',
							cursor: 'pointer',
						}}
						disabled={isSubmitting}
					>
						✕
					</button>
				</div>
			)}
		</div>
	);
}
