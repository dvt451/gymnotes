import React, { useContext } from 'react'
import { GlobalContext } from '../../../../../context/GlobalContext';
import { colors, createCommonStyle } from '../../../../../styles/commonStyle';

export default function ReorderButton({
	editState,
	state,
	handleToggleReorder,
}) {
	const { mainColor } = useContext(GlobalContext);

	const commonStyle = createCommonStyle(mainColor);
	return (
		editState && state.trainingDays.length > 1 && (
			<div style={commonStyle.titleHeader}>
				<button
					onClick={handleToggleReorder} // 🚨 Используем обновленную функцию
					disabled={state.isLoading}
					style={{
						...commonStyle.EditButton,
						backgroundColor: state.isReordering ? colors.purple : 'transparent',
						opacity: state.isLoading ? 0.5 : 1
					}}
				>
					<span style={{
						...commonStyle.EditButtonText,
						color: state.isReordering ? colors.blueLight : '#fff',
						opacity: state.isReordering ? 1 : 0.25
					}}>
						{state.isReordering ? 'Reordering...' : 'Reorder'}
					</span>
					{state.isReordering ?
						<img src="/img/icons/editblue.png" alt="Edit icon" style={commonStyle.EditIcon} />
						: <img src="/img/icons/edit.png" alt="Edit icon" style={commonStyle.EditIcon} />
					}
				</button>
			</div>
		)
	)
}
