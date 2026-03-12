import React, { useContext, useState } from 'react'
import { GlobalContext } from '../../../context/GlobalContext';
import { createExercisesStyles } from './ExersicesStyles';
import { createCommonStyle } from '../../../styles/commonStyle';
import ExerciseItem from './ExerciseItem/ExerciseItem';

export default function ExercisesList({
	exercises,
	setExercises,
	date,
	trainingId,
	BASE_URL,
	previousExercisesByLibraryId,
	previousDateKey,
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);
	const [editState, setEditState] = useState(false);
	const [expandedExerciseId, setExpandedExerciseId] = useState(null);

	return (
		<>
			<div style={commonStyle.titleHeader}>
				<h2 style={commonStyle.title}>Exercises</h2>
				<button style={commonStyle.EditButton} onClick={() => setEditState(!editState)}>
					<span
						style={{
							...commonStyle.EditButtonText,
							...{ color: editState && colors.orange, opacity: editState ? 1 : 0.25 },
						}}
					>
						{editState ? 'Editing...' : 'Edit...'}
					</span>
					{editState ? <img src="/img/icons/editorange.png" alt="icon" /> : <img src="/img/icons/edit.png" alt="icon" />}
				</button>
			</div>
			{exercises.length === 0 && (
				<p style={styles.noExercises}>Нет упражнений. Добавьте новое ниже.</p>
			)}

			<div style={styles.list}>
				{Array.isArray(exercises) ? (
					exercises.map((item, index) => (
						<ExerciseItem
							key={item._id?.toString() || `index-${index}`}
							item={item}
							exercises={exercises}
							setExercises={setExercises}
							date={date}
							trainingId={trainingId}
							BASE_URL={BASE_URL}
							expandedExerciseId={expandedExerciseId}
							setExpandedExerciseId={setExpandedExerciseId}
							editState={editState}
							prevWeights={previousExercisesByLibraryId[String(item.exerciseUserLibraryId || '')] || []}
							previousDate={previousDateKey}
						/>
					))
				) : (
					<p style={styles.error}>Невозможно отобразить упражнения</p>
				)}
			</div>
		</>
	)
}
