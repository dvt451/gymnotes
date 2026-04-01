import React, { useContext } from 'react'
import { GlobalContext } from '../../../../../context/GlobalContext';
import { createPopupStyle } from '../../../../widgets/popupStyle';
import { colors } from '../../../../../styles/commonStyle';
import { FaTrash } from 'react-icons/fa';

export default function EditExerciseTrash({ exercise, removeExerciseFromEditing }) {
	const { mainColor } = useContext(GlobalContext);

	const popupStyle = createPopupStyle(mainColor);

	return (
		<button
			style={{
				...popupStyle.removeExerciseButton,
				backgroundColor: colors.red,
			}}
			onClick={() => removeExerciseFromEditing(exercise)}
		>
			<FaTrash />
		</button>
	)
}
