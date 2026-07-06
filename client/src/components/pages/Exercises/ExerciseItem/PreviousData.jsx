import React, { useContext } from 'react'
import ExercisePrevCommentSection from './ExercisePrevCommentSection'
import PrevWeights from './PrevWeights'
import InlineSpinner from '../../../widgets/InlineSpinner'
import { GlobalContext } from '../../../../context/GlobalContext'
import { createExercisesStyles } from '../ExersicesStyles'

export default function PreviousData({
	item,
	setExercises,
	date,
	trainingId,
	BASE_URL,
	isExpanded,
	isReordering,
	prevWeights,
	prevComment,
	previousDate,
	isPreviousHistoryLoading,
}) {

	return (
		<>
			<PrevWeights
				weights={prevWeights}
				previousDate={previousDate}
			/>
			<ExercisePrevCommentSection
				item={item}
				setExercises={setExercises}
				date={date}
				trainingId={trainingId}
				BASE_URL={BASE_URL}
				isReordering={isReordering}
				prevComment={prevComment}
				previousDate={previousDate}
			/>
		</>
	)
}
