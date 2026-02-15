import React, { use, useContext } from 'react';
import { colors, createCommonStyle } from '../../../styles/commonStyle';
import { GlobalContext } from '../../../context/GlobalContext';

function DateListControls({
	editState,
	onToggleEdit,
}) {
	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);
	return (
		<div style={{
			display: 'flex',
			justifyContent: 'space-between',
			alignItems: 'center',
		}}>
			<button
				onClick={onToggleEdit}
				style={{
					...commonStyle.EditButton,
					marginRight: '10px'
				}}
			>
				<span style={{
					...commonStyle.EditButtonText,
					color: editState ? colors.orange : '#fff',
					opacity: editState ? 1 : 0.25
				}}>
					{editState ? 'Editing...' : 'Edit...'}
				</span>
				{editState ?
					<img src="/img/icons/editorange.png" alt="Edit icon" style={commonStyle.EditIcon} />
					: <img src="/img/icons/edit.png" alt="Edit icon" style={commonStyle.EditIcon} />
				}
			</button>
		</div>

	);
}

export default DateListControls;