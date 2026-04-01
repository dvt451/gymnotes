import React, { useContext } from 'react';
import { createCommonStyle } from '../../../../../styles/commonStyle';
import { GlobalContext } from '../../../../../context/GlobalContext';
import Popup from '../../../../widgets/Popup';
import { createPopupStyle } from '../../../../widgets/popupStyle';

function TrainingPopup({
	isOpen,
	mode, // 'create' | 'edit'
	training = null,
	name,
	text,
	isLoading,
	onNameChange,
	onTextChange,
	onClose,
	onSubmit,
	onDelete
}) {
	const { mainColor } = useContext(GlobalContext);
	const popupStyle = createPopupStyle(mainColor);

	const commonStyle = createCommonStyle(mainColor);

	const title = mode === 'create' ? 'New Training' : 'Edit Training';
	const submitText = mode === 'create'
		? (isLoading ? 'Creating...' : 'Create')
		: (isLoading ? 'Saving...' : 'Save Changes');

	return (
		<Popup isOpen={isOpen} onClose={onClose}>
			<h3 style={popupStyle.title}>{title}</h3>

			<div style={popupStyle.popupContentInputs}>
				<input
					type="text"
					placeholder="Name"
					value={name}
					onChange={onNameChange}
					style={popupStyle.popupInput}
				/>
				<input
					type="text"
					placeholder="Description (optional)"
					value={text}
					onChange={onTextChange}
					style={popupStyle.popupInput}
				/>
			</div>

			<div style={popupStyle.popupButtons}>
				{mode === 'edit' && onDelete && (
					<button
						onClick={onDelete}
						style={{
							...commonStyle.button,
							...commonStyle.popupDeleteButton
						}}
						disabled={isLoading}
					>
						Delete Training
					</button>
				)}

				<button
					onClick={onClose}
					style={{ ...commonStyle.button, ...commonStyle.popupCancelButton }}
				>
					Cancel
				</button>

				<button
					onClick={onSubmit}
					style={{ ...commonStyle.button, ...commonStyle.popupCreateButton }}
					disabled={isLoading}
				>
					{submitText}
				</button>
			</div>
		</Popup>
	);
}

export default TrainingPopup;
