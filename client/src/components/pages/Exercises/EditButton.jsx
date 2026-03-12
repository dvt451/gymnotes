import React, { useContext } from 'react'
import { createCommonStyle } from '../../../styles/commonStyle';
import { GlobalContext } from '../../../context/GlobalContext';

export default function EditButton({
	editState,
	setEditState
}) {
	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);

	return (
		<button style={{
			...commonStyle.exerciseEditButton,
			...editState && commonStyle.exerciseEditButtonEditing
		}} onClick={() => setEditState(!editState)}>
			{editState ? <img src="/img/icons/editblack.png" alt="icon" /> : <img src="/img/icons/editorange.png" alt="icon" />}
		</button >
	)
}
