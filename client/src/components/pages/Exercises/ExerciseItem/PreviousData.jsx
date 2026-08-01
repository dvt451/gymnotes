import React, { useContext } from 'react'
import PrevWeights from './PrevWeights'
import InlineSpinner from '../../../widgets/InlineSpinner'
import { GlobalContext } from '../../../../context/GlobalContext'

export default function PreviousData({
	item,
	setExercises,
	date,
	trainingId,
	BASE_URL,
	isExpanded,
	isReordering,
	prevHistoryEntries = [],
	prevWeights,
	prevComment,
	previousDate,
	isPreviousHistoryLoading,
}) {

	if (isPreviousHistoryLoading) {
		return (
			<div style={{ display: 'flex', justifyContent: 'center', padding: '8px 0' }}>
				<InlineSpinner size={18} thickness={2} color={useContext(GlobalContext).mainColor || '#92E33C'} />
			</div>
		);
	}

	return (
		<PrevWeights
			historyEntries={prevHistoryEntries}
			weights={prevWeights}
			previousDate={previousDate}
			prevComment={prevComment}
		/>
	)
}
