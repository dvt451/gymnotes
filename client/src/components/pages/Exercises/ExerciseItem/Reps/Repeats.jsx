import React, { useContext, useState, useRef, useEffect } from 'react';
import { createExercisesStyles } from '../../ExersicesStyles';
import { colors, toRem } from '../../../../../styles/commonStyle';
import { getToken } from '../../../../utils/getToken';
import { GlobalContext } from '../../../../../context/GlobalContext';
import InlineSpinner from '../../../../widgets/InlineSpinner';

export default function Repeats({ BASE_URL, editState, isExpanded, trainingId, date, item: exercise, w: weight, setExercises, showAddInput, setShowAddInput, editingSetIndex, setEditingSetIndex, repsInput, setRepsInput }) {
	const [editingRepsValue, setEditingRepsValue] = useState('');
	const [isSubmitting, setIsSubmitting] = useState(false);

	const [addIsSubmitting, setAddIsSubmitting] = useState(false);

	// Refs для отслеживания кликов вне элементов
	const addInputRef = useRef(null);
	const editInputRefs = useRef({});

	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);

	// Закрываем добавление при клике вне его области
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (showAddInput && addInputRef.current && !addInputRef.current.contains(event.target)) {
				handleCancelAdd();
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [showAddInput]);

	// Закрываем редактирование при клике вне его области
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (editingSetIndex !== null && editInputRefs.current[editingSetIndex] && !editInputRefs.current[editingSetIndex].contains(event.target)) {
				handleSaveSet(editingSetIndex);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, [editingSetIndex, editingRepsValue]);

	const getRepsValue = (setValue) => {
		if (setValue && typeof setValue === 'object') {
			const repsValue = Number(setValue.reps);
			return Number.isFinite(repsValue) ? repsValue : 0;
		}
		const repsValue = Number(setValue);
		return Number.isFinite(repsValue) ? repsValue : 0;
	};

	const startEditing = (setValue, index) => {
		if (!editState || !isExpanded) return;
		// Закрываем добавление если открыто
		if (showAddInput) {
			setShowAddInput(false);
			setRepsInput('');
		}
		setEditingSetIndex(index);
		setEditingRepsValue(getRepsValue(setValue).toString());
	};

	const cancelEditing = () => {
		setEditingSetIndex(null);
		setEditingRepsValue('');
	};

	const handleSaveSet = async (index) => {
		if (!editingRepsValue.trim()) return;

		const reps = parseInt(editingRepsValue, 10);

		if (reps === 0) {
			await handleDeleteSet(index);
			return;
		}

		if (isNaN(reps) || reps < 0) {
			alert('Введите корректное число повторений');
			return;
		}

		setIsSubmitting(true);

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${exercise._id}/weights/${weight._id}/sets/${index}`;

			const res = await fetch(url, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ reps }),
			});

			if (!res.ok) {
				const data = await res.json();
				throw new Error(data.message || `Ошибка ${res.status}: не удалось изменить подход`);
			}

			setExercises(prevExercises =>
				prevExercises.map(ex => {
					if (ex._id === exercise._id) {
						return {
							...ex,
							weights: ex.weights.map(wt => {
								if (wt._id === weight._id) {
									return {
										...wt,
										sets: wt.sets.map((s, idx) => {
											if (idx === index) {
												return (s && typeof s === 'object') ? { ...s, reps } : reps;
											}
											return s;
										}),
									};
								}
								return wt;
							}),
						};
					}
					return ex;
				})
			);

			setEditingSetIndex(null);
			setEditingRepsValue('');

		} catch (err) {
			console.error('Ошибка при изменении подхода:', err);
			alert(`Ошибка: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleDeleteSet = async (index) => {
		if (index === undefined) return;
		setIsSubmitting(true);

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${exercise._id}/weights/${weight._id}/sets/${index}`;

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
					if (ex._id === exercise._id) {
						return {
							...ex,
							weights: ex.weights.map(wt => {
								if (wt._id === weight._id) {
									return {
										...wt,
										sets: wt.sets.filter((_, idx) => idx !== index),
									};
								}
								return wt;
							}),
						};
					}
					return ex;
				})
			);

			setEditingSetIndex(null);
			setEditingRepsValue('');

		} catch (err) {
			console.error('Ошибка при удалении подхода:', err);
			alert(`Ошибка: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleEditKeyPress = (e, index) => {
		if (e.key === 'Enter') {
			handleSaveSet(index);
		}
		if (e.key === 'Escape') {
			cancelEditing();
		}
	};



	const handleCancelAdd = () => {
		setShowAddInput(false);
		setRepsInput('');
	};

	const handleAddSubmit = async () => {
		if (!repsInput.trim()) return;

		const reps = parseInt(repsInput, 10);
		if (isNaN(reps) || reps <= 0) {
			alert('Введите корректное число повторений.');
			return;
		}

		setAddIsSubmitting(true);

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${exercise._id}/weights/${weight._id}/sets`;

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
					if (ex._id === exercise._id) {
						return {
							...ex,
							weights: ex.weights.map(w => {
								if (w._id === weight._id) {
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

			setShowAddInput(false);
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
			<div style={{
				display: 'flex',
				alignItems: 'center',
				gap: '10px',
				width: '100%',
			}}>
				{/* Список существующих подходов */}
				<div style={{
					...styles.repsContainer,
				}}>
					<div style={{
						...styles.repsContainerRow,
						gridTemplateColumns: editState && isExpanded ? `repeat(3, 1fr)` : `repeat(4, 1fr)`

					}}>
						{weight.sets.map((setValue, index) => (
							<div
								key={index}
								style={{
									display: 'inline-block', margin: '0 2px',
									background: editState && isExpanded && colors.orange,
									border: toRem(1) + ' solid ' + colors.popupBorderColor,
									padding: toRem(5) + ' ' + toRem(18),
									borderRadius: '0.4em',
									cursor: editState && isExpanded ? 'pointer' : 'default',
									margin: '0',
								}}
								ref={el => editInputRefs.current[index] = el}
							>
								{editingSetIndex === index ? (
									<input
										type="text"
										inputMode="numeric"
										value={editingRepsValue}
										onChange={(e) => setEditingRepsValue(e.target.value)}
										onKeyDown={(e) => handleEditKeyPress(e, index)}
										onBlur={() => handleSaveSet(index)}
										style={{
											width: '50px',
											padding: '4px 6px',
											borderRadius: '6px',
											border: `1px solid ${mainColor}`,
											textAlign: 'center',
											fontSize: '14px',
											backgroundColor: 'white',
											color: colors.blueDark,
										}}
										autoFocus
										disabled={isSubmitting}
									/>
								) : (
									<button
										onClick={() => startEditing(setValue, index)}
										title={editState && isExpanded ? "Нажмите для редактирования\nВведите 0 для удаления" : ""}
									>
										<span style={{
											...styles.setText,
											...(editState && isExpanded && {
												borderRadius: '4px',
												color: colors.black,
											})
										}}>
											{getRepsValue(setValue)}
										</span>
									</button>

								)}
							</div>
						))}

						{!editState && isExpanded && showAddInput && (<div ref={addInputRef} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
							<input
								type="text"
								inputMode="decimal"
								pattern="[0-9]*\.?[0-9]*"
								value={repsInput}
								onChange={(e) => setRepsInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') {
										e.preventDefault();
										if (showAddInput && !addIsSubmitting && repsInput.trim()) {
											handleAddSubmit();
										}
									}
									if (e.key === 'Escape') {
										e.preventDefault();
										handleCancelAdd();
									}
								}}
								onBlur={() => {
									// Закрываем инпут при потере фокуса (когда нажали Done на мобильной клавиатуре)
									if (showAddInput && !addIsSubmitting) {
										setRepsInput('');
										handleAddSubmit();
									}
								}}
								style={{
									backgroundColor: 'transparent',
									border: toRem(1) + ' dashed ' + colors.popupBorderColor,
									padding: '6px 10px',
									borderRadius: '8px',
									fontSize: '16px',
									width: '100%',
									textAlign: 'center',
									color: colors.white,
								}}
								autoFocus
								min="1"
								disabled={addIsSubmitting}
								enterKeyHint="done"
							/>
						</div>
						)}
					</div>
				</div>
			</div >
		</>
	);
}
