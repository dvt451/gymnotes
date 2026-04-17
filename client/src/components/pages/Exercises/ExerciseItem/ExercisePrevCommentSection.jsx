import React, { useContext } from 'react'
import { createExercisesStyles } from '../ExersicesStyles';
import { GlobalContext } from '../../../../context/GlobalContext';

export default function ExercisePrevCommentSection({ prevComment, }) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const normalizedPreviousComment = (prevComment || '').trim();

	return (
		normalizedPreviousComment && (
			<div style={styles.exercisePreviousCommentRow}>
				<span style={styles.exercisePreviousCommentText}>{normalizedPreviousComment}</span>
			</div>
		)
	)
}
