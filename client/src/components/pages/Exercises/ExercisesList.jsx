import React, { useContext, useState } from 'react'
import { GlobalContext } from '../../../context/GlobalContext';
import { createExercisesStyles } from './ExersicesStyles';
import { colors, createCommonStyle } from '../../../styles/commonStyle';
import ExerciseItem from './ExerciseItem/ExerciseItem';

export default function ExercisesList({
	exercises,
	setExercises,
	date,
	trainingId,
	BASE_URL,
	previousExercisesByLibraryId,
	previousDateKey,
	editState
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);
	const [expandedExerciseId, setExpandedExerciseId] = useState(null);

	return (
		<>
			<div style={commonStyle.titleHeader}>
				<h2 style={commonStyle.title}>Exercises</h2>
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
