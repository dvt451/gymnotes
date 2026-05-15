import React, { useContext, useEffect, useState } from 'react';
import { GlobalContext } from '../../../context/GlobalContext';
import { createExercisesStyles } from './ExersicesStyles';
import { colors, createCommonStyle } from '../../../styles/commonStyle';
import ExerciseItem from './ExerciseItem/ExerciseItem';
import { getToken } from '../../utils/getToken';

export default function ExercisesList({
	exercises,
	setExercises,
	date,
	trainingId,
	BASE_URL,
	isPreviousHistoryLoading,
	previousExercisesByLibraryId,
	previousDateKey,
	editState,
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);
	const [expandedExerciseId, setExpandedExerciseId] = useState(null);
	const [isReordering, setIsReordering] = useState(false);
	const [isSavingOrder, setIsSavingOrder] = useState(false);
	const [isCommentEditingId, setIsCommentEditingId] = useState(null);

	useEffect(() => {
		if (editState) return;
		setIsReordering(false);
		setExpandedExerciseId(null);
		setIsCommentEditingId(null);
	}, [editState]);

	useEffect(() => {
		if (exercises.length > 1) return;
		setIsReordering(false);
	}, [exercises.length]);

	const moveExerciseInList = async (index, direction) => {
		if (isSavingOrder) return;

		const newIndex = index + direction;
		if (newIndex < 0 || newIndex >= exercises.length) return;

		const previousExercises = [...exercises];
		const nextExercises = [...exercises];
		[nextExercises[index], nextExercises[newIndex]] = [nextExercises[newIndex], nextExercises[index]];

		setExpandedExerciseId(null);
		setIsCommentEditingId(null);
		setExercises(nextExercises);
		setIsSavingOrder(true);

		try {
			const token = await getToken();
			const response = await fetch(
				`${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/reorder`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({
						order: nextExercises.map((exercise) => exercise._id || exercise.id),
					}),
				}
			);

			if (!response.ok) {
				const message = await response.text();
				throw new Error(message || 'Failed to save exercise order');
			}
		} catch (err) {
			console.error('Error saving exercise order:', err);
			setExercises(previousExercises);
		} finally {
			setIsSavingOrder(false);
		}
	};

	return (
		<>
			<div style={commonStyle.titleHeader}>
				<h2 style={commonStyle.title}>Exercises</h2>
				{editState && exercises.length > 1 && (
					<button
						type="button"
						onClick={() => {
							setExpandedExerciseId(null);
							setIsReordering((prev) => !prev);
							setIsCommentEditingId(null);
						}}
						style={{
							...commonStyle.EditButton,
							backgroundColor: isReordering ? colors.orange : 'transparent',
							border: 'none',
							borderRadius: '8px',
							padding: '8px 12px',
							cursor: 'pointer',
							opacity: isSavingOrder ? 0.7 : 1,
						}}
						disabled={isSavingOrder}
					>
						<span
							style={{
								...commonStyle.EditButtonText,
								color: isReordering ? colors.black : colors.blueLight,
								opacity: 1,
								fontSize: '16px',
							}}
						>
							{isSavingOrder
								? 'Saving order...'
								: isReordering
									? 'Reordering...'
									: 'Reorder'}
						</span>
					</button>
				)}
			</div>
			{exercises.length === 0 && (
				<p style={styles.noExercises}>No exercises yet. Add a new one below.</p>
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
							setIsCommentEditingId={setIsCommentEditingId}
							isCommentEditingId={isCommentEditingId}
							editState={editState}
							isReordering={isReordering}
							index={index}
							exercisesCount={exercises.length}
							moveExerciseInList={moveExerciseInList}
							isSavingOrder={isSavingOrder}
							isPreviousHistoryLoading={isPreviousHistoryLoading}
							prevWeights={
								previousExercisesByLibraryId[
									String(item.exerciseUserLibraryId || '')
								]?.weights || []
							}
							prevComment={
								previousExercisesByLibraryId[
									String(item.exerciseUserLibraryId || '')
								]?.comment || ''
							}
							previousDate={previousDateKey}
						/>
					))
				) : (
					<p style={styles.error}>Unable to display exercises.</p>
				)}
			</div>
		</>
	);
}
