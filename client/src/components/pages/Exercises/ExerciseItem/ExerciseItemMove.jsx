import React, { useContext } from 'react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';
import { GlobalContext } from '../../../../context/GlobalContext';
import { colors } from '../../../../styles/commonStyle';
import { createPopupStyle } from '../../../widgets/popupStyle';

export default function ExerciseItemMove({
	index,
	exercisesCount,
	moveExerciseInList,
	disabled = false,
}) {
	const { mainColor } = useContext(GlobalContext);
	const popupStyle = createPopupStyle(mainColor);
	const arrowStyle = {
		backgroundColor: colors.blueLight,
		padding: '15px 20px',
		borderRadius: '5px'
	}
	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'absolute', right: '0px', top: '0px' }} >
			<button
				type="button"
				style={arrowStyle}
				onClick={(event) => {
					event.stopPropagation();
					moveExerciseInList(index, 1);
				}}
				disabled={disabled || index === exercisesCount - 1}
				aria-label="Move exercise down"
			>
				<FaArrowDown />
			</button>
			<button
				type="button"
				style={{ ...arrowStyle, backgroundColor: colors.green }}
				onClick={(event) => {
					event.stopPropagation();
					moveExerciseInList(index, -1);
				}}
				disabled={disabled || index === 0}
				aria-label="Move exercise up"
			>
				<FaArrowUp />
			</button>
		</div>
	);
}
