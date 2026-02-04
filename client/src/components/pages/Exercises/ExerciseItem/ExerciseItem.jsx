import React, { useState } from 'react';
import styles from '../ExersicesStyles';
import Weights from './Weights/Weights';
import DeleteExerciseItem from './DeleteExerciseItem';

export default function ExerciseItem({
	item,
	setExercises,
	date,
	trainingId,
	BASE_URL,
	expandedExerciseId,
	setExpandedExerciseId,
	editState
}) {
	const toggleExpand = (e) => {
		// Останавливаем всплытие события, чтобы клик по кнопке удаления не открывал упражнение
		e.stopPropagation();

		// Если текущее упражнение уже развернуто, НИЧЕГО не делаем
		if (expandedExerciseId === item._id) {
			return; // Ничего не меняем - упражнение остается развернутым
		} else {
			// Разворачиваем текущее упражнение
			setExpandedExerciseId(item._id);
		}
	};

	// Проверяем, развернуто ли текущее упражнение
	const isExpanded = expandedExerciseId === item._id;

	return (
		<div style={{ ...styles.exerciseBlock, ...(!isExpanded && { cursor: 'pointer' }) }}
			onClick={toggleExpand}
		>
			<div style={styles.exerciseHeader}>
				<div
					style={{
						...styles.exerciseTitle,
						...(isExpanded && styles.exerciseTitleActive) // Добавляем активный стиль если развернуто
					}}
				>
					{item.name}
				</div>
				{editState && isExpanded && <DeleteExerciseItem
					item={item}
					setExercises={setExercises}
					date={date}
					trainingId={trainingId}
					BASE_URL={BASE_URL}
				/>}
			</div>
			<Weights
				editState={editState}
				item={item}
				setExercises={setExercises}
				date={date}
				trainingId={trainingId}
				BASE_URL={BASE_URL}
				isExpanded={isExpanded}
			/>
		</div>
	);
}