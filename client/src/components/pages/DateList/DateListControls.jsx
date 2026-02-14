import React from 'react';
import { colors, commonStyle } from '../../../styles/commonStyle';

function DateListControls({
	editState,
	onToggleEdit,
}) {
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