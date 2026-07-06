import React, { useContext } from 'react'
import { createExercisesStyles } from '../ExersicesStyles';
import { GlobalContext } from '../../../../context/GlobalContext';

export default function ExercisePrevCommentSection({
	prevComment,
	previousDate = '',
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const normalizedPreviousComment = (prevComment || '').trim();

	return (
		normalizedPreviousComment && (
			<div style={styles.exercisePreviousCommentRow}>
				{previousDate && (
					<span style={styles.prevMetaText}>Previous:</span>
				)}
				<span style={styles.exercisePreviousCommentText}>{normalizedPreviousComment}</span>
			</div>
		)
	)
}
