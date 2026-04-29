import React, { useContext, useState, useRef, useEffect } from 'react';
import { createExercisesStyles } from '../../ExersicesStyles';
import AddWeight from './AddWeight';
import DeleteWeights from './DeleteWeights';
import Repeats from '../Reps/Repeats';
import { colors } from '../../../../../styles/commonStyle';
import { getToken } from '../../../../utils/getToken';
import { GlobalContext } from '../../../../../context/GlobalContext';

export default function Weights({ item, editState, setExercises, date, trainingId, isExpanded, BASE_URL }) {
	const [editingWeightId, setEditingWeightId] = useState(null);
	const [editingWeightValue, setEditingWeightValue] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mainColor } = useContext(GlobalContext);

	const styles = createExercisesStyles(mainColor);

	// Ref для отслеживания кликов вне инпута редактирования
	const editInputRef = useRef(null);

	// Закрываем редактирование при клике вне его области
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (editingWeightId !== null && editInputRef.current && !editInputRef.current.contains(event.target)) {
				// Сохраняем если есть изменения, иначе отменяем
				if (editingWeightValue.trim() && parseFloat(editingWeightValue.replace(',', '.')) > 0) {
					const weight = item.weights?.find(w => w._id === editingWeightId);
					if (weight) {
						handleSaveWeight(weight);
					} else {
						cancelEditing();
					}
				} else {
					cancelEditing();
				}
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [editingWeightId, editingWeightValue]);

	const startEditing = (weight) => {
		if (!editState || !isExpanded) return;
		setEditingWeightId(weight._id);
		setEditingWeightValue(weight.weight.toString());
	};

	const cancelEditing = () => {
		setEditingWeightId(null);
		setEditingWeightValue('');
	};

	const handleSaveWeight = async (weight) => {
		if (!editingWeightValue.trim()) return;

		const normalizedInput = editingWeightValue.replace(',', '.');
		const newWeightValue = parseFloat(normalizedInput);

		if (isNaN(newWeightValue) || newWeightValue <= 0) {
			alert('Введите корректный вес (положительное число)');
			return;
		}

		setIsSubmitting(true);

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${item._id}/weights/${weight._id}`;

			const res = await fetch(url, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ weight: newWeightValue }),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.message || 'Не удалось изменить вес');

			// Обновляем состояние с измененным весом
			setExercises(prevExercises =>
				prevExercises.map(ex => {
					if (ex._id === item._id) {
						return {
							...ex,
							weights: ex.weights.map(w => {
								if (w._id === weight._id) {
									return { ...w, weight: newWeightValue };
								}
								return w;
							}),
						};
					}
					return ex;
				})
			);

			setEditingWeightId(null);
			setEditingWeightValue('');
		} catch (err) {
			console.error('Ошибка при изменении веса:', err);
			alert(`Ошибка: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleKeyPress = (e, weight) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			handleSaveWeight(weight);
		}
		if (e.key === 'Escape') {
			e.preventDefault();
			cancelEditing();
		}
	};

	return (
		<div style={styles.settingsRow}>
			{(!item.weights || item.weights.length === 0) && (
				<p style={styles.noWeights}>Нет весов</p>
			)}

			{item.weights && item.weights.map((w) => (
				<div key={w._id} style={styles.weightBlock}>
					{editingWeightId === w._id ? (
						<div ref={editInputRef}>
							<input
								type="text"
								inputMode="decimal"
								pattern="[0-9]*\.?[0-9]*"
								value={editingWeightValue}
								onChange={(e) => setEditingWeightValue(e.target.value)}
								onKeyDown={(e) => handleKeyPress(e, w)}
								onBlur={() => {
									if (editingWeightId === w._id && !isSubmitting) {
										if (editingWeightValue.trim() && parseFloat(editingWeightValue.replace(',', '.')) !== w.weight) {
											handleSaveWeight(w);
										} else {
											cancelEditing();
										}
									}
								}}
								style={{
									width: '70px',
									padding: '6px 8px',
									borderRadius: '8px',
									border: `1px solid ${mainColor}`,
									textAlign: 'center',
									fontSize: '14px',
									backgroundColor: 'white',
									color: colors.blueDark
								}}
								autoFocus
								disabled={isSubmitting}
								placeholder="Вес в кг"
								enterKeyHint="done"
							/>
						</div>
					) : (
						<button
							style={{
								...styles.weightButton,
								...(editState && isExpanded && {
									cursor: 'pointer',
									position: 'relative',
								})
							}}
							onClick={() => editState && isExpanded ? startEditing(w) : null}
							title={editState && isExpanded ? "Нажмите для редактирования веса" : ""}
						>
							<span style={{
								...styles.weightText,
								...(editState && isExpanded && {
									backgroundColor: colors.blueLight,
									padding: '0 4px',
									borderRadius: '4px',
									color: colors.black,
									transition: 'all 0.2s ease',
								})
							}}>
								{w.weight}kg
							</span>
						</button>
					)}

					<Repeats
						editState={editState}
						BASE_URL={BASE_URL}
						trainingId={trainingId}
						date={date}
						item={item}
						w={w}
						isExpanded={isExpanded}
						setExercises={setExercises}
					/>

					{editState && isExpanded && (
						<DeleteWeights
							BASE_URL={BASE_URL}
							trainingId={trainingId}
							date={date}
							exerciseId={item._id}
							weightId={w._id}
							setExercises={setExercises}
						/>
					)}
				</div>
			))}

			{!editState && isExpanded && (
				<AddWeight
					BASE_URL={BASE_URL}
					date={date}
					trainingId={trainingId}
					setExercises={setExercises}
					itemID={item._id}
				/>
			)}
		</div>
	);
}