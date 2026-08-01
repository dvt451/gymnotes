import React, { useContext } from 'react'
import { createExercisesStyles } from '../ExersicesStyles';
import { GlobalContext } from '../../../../context/GlobalContext';

export default function ExercisePrevCommentSection({
	historyEntries = [],
	prevComment,
	previousDate = '',
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);

	const normalizedEntries = Array.isArray(historyEntries) && historyEntries.length > 0
		? historyEntries
		: (prevComment ? [{ date: previousDate, comment: prevComment }] : []);

	return (
		normalizedEntries.some((entry) => (entry?.comment || '').trim()) && (

			<div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '4px' }}>
				{normalizedEntries.map((entry, index) => {
					const entryDate = entry?.date || previousDate;
					const normalizedPreviousComment = (entry?.comment || '').trim();
					if (!normalizedPreviousComment) return null;

					return (
						<div key={`${entry?.date || previousDate}-${index}`} style={styles.exercisePreviousCommentRow}>
							{(entry?.date || previousDate) && (
								<span style={styles.prevMetaText}>{entryDate}:</span>
							)}
							<span style={styles.exercisePreviousCommentText}>{normalizedPreviousComment}</span>
						</div>
					);
				})}
			</div>
		)
	)
}
