import React, { useContext } from 'react'
import { GlobalContext } from '../../../../../context/GlobalContext';
import { createHomeStyle } from '../../homeStyles';
import { createCommonStyle } from '../../../../../styles/commonStyle';

export default function SavingOrderButton({ editState, state, handleSaveReorder }) {
	const { mainColor } = useContext(GlobalContext);
	const homeStyle = createHomeStyle(mainColor);
	const commonStyle = createCommonStyle(mainColor);

	return (
		editState && state.isReordering && (
			<button
				onClick={handleSaveReorder}
				disabled={state.isLoading}
				style={{
					...commonStyle.button,
					...homeStyle.trainingCardAddButton,
					opacity: state.isLoading ? 0.7 : 1,
				}}
			>
				{state.isLoading ? '💾 Saving...' : '💾 Save Order'}
			</button>
		)
	)
}
