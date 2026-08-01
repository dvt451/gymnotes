import React, { useContext, useState, useRef, useEffect } from 'react';
import { createExercisesStyles } from '../../ExersicesStyles';
import AddWeight from './AddWeight';
import DeleteWeights from './DeleteWeights';
import Repeats from '../Reps/Repeats';
import { colors, toRem } from '../../../../../styles/commonStyle';
import { getToken } from '../../../../utils/getToken';
import { GlobalContext } from '../../../../../context/GlobalContext';
import { getToken as getAuthToken } from '../../../../utils/getToken';

export default function Weights({ item, editState, setExercises, date, trainingId, isExpanded, BASE_URL }) {
	const [editingWeightId, setEditingWeightId] = useState(null);
	const [editingWeightValue, setEditingWeightValue] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { mainColor } = useContext(GlobalContext);
	const [editingSetIndex, setEditingSetIndex] = useState(null);
	const [showAddInputForWeight, setShowAddInputForWeight] = useState(null);
	const [repsInputForWeight, setRepsInputForWeight] = useState('');
	const [isAddingRep, setIsAddingRep] = useState(false);

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

	const openAddRepInput = (weightId) => {
		setShowAddInputForWeight(weightId);
		setRepsInputForWeight('');
	};

	const cancelAddRepInput = () => {
		setShowAddInputForWeight(null);
		setRepsInputForWeight('');
	};

	const handleAddRepSubmit = async (weightId) => {
		const trimmedInput = repsInputForWeight.trim();
		if (!trimmedInput) return;

		const reps = parseInt(trimmedInput, 10);
		if (Number.isNaN(reps) || reps <= 0) {
			alert('Введите корректное число повторений.');
			return;
		}

		setIsAddingRep(true);

		try {
			const token = await getAuthToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${item._id}/weights/${weightId}/sets`;

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
					if (ex._id === item._id) {
						return {
							...ex,
							weights: ex.weights.map(w => {
								if (w._id === weightId) {
									return {
										...w,
										sets: [...(w.sets || []), repsValue],
									};
								}
								return w;
							}),
						};
					}
					return ex;
				})
			);

			cancelAddRepInput();
		} catch (err) {
			console.error('Ошибка при добавлении подхода:', err);
			alert(`Ошибка: ${err.message}`);
		} finally {
			setIsAddingRep(false);
		}
	};

	return (
		<div style={{ ...styles.settingsRow, ...styles.weightsContainer }}>
			{(!item.weights || item.weights.length === 0) && (
				<p style={styles.noWeights}>Нет весов</p>
			)}

			{item.weights && item.weights.map((w) => (
				<div key={w._id} style={styles.weightBlock}>
					<div
						style={{
							display: 'flex',
							gap: toRem(10),
							alignItems: 'center',
						}}
					>
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
									{w.weight} <span style={{
										fontSize: toRem(16),
									}}>kg</span>
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
							editingSetIndex={editingSetIndex}
							setEditingSetIndex={setEditingSetIndex}
							showAddInput={showAddInputForWeight === w._id}
							setShowAddInput={(value) => setShowAddInputForWeight(value ? w._id : null)}
							repsInput={repsInputForWeight}
							setRepsInput={setRepsInputForWeight}
							handleAddRepSubmit={() => handleAddRepSubmit(w._id)}
							handleCancelAdd={cancelAddRepInput}
							isAddingRep={isAddingRep}
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

					{!editState && isExpanded && (
						<div style={{ marginTop: toRem(8) }}>
							<button
								type="button"
								onClick={() => openAddRepInput(w._id)}
								style={{
									...styles.addSetBtn,
									color: mainColor,
									width: '100%',
								}}
							>
								+ Add reps
							</button>
						</div>
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