import React, { useContext } from 'react'
import { GlobalContext } from '../../../../../context/GlobalContext';
import { createPopupStyle } from '../../../../widgets/popupStyle';
import { colors } from '../../../../../styles/commonStyle';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

export default function EditExerciseListMove({
	moveExerciseInEditingList, i,
	editingExercises
}) {
	const { mainColor } = useContext(GlobalContext);

	const popupStyle = createPopupStyle(mainColor);

	return (
		<div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

			<button
				type="button"
				style={{
					...popupStyle.removeExerciseButton,
					backgroundColor: colors.blueLight,
					height: '100%',
				}}
				onClick={() => moveExerciseInEditingList(i, 1)}
				disabled={i === editingExercises.length - 1}
			>
				<FaArrowDown />
			</button>
			<button
				type="button"
				style={{
					...popupStyle.removeExerciseButton,
					backgroundColor: colors.green,
					height: '100%',

				}}
				onClick={() => moveExerciseInEditingList(i, -1)}
				disabled={i === 0}
			>
				<FaArrowUp />
			</button>
		</div>
	)
}
