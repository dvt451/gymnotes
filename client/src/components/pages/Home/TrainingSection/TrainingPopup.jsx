import React from 'react';
import { commonStyle } from '../../../../styles/commonStyle';
import { homeStyle } from '../homeStyles';

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
	if (!isOpen) return null;

	const title = mode === 'create' ? 'New Training' : 'Edit Training';
	const submitText = mode === 'create'
		? (isLoading ? 'Creating...' : 'Create')
		: (isLoading ? 'Saving...' : 'Save Changes');

	return (
		<div style={commonStyle.popup} onClick={onClose}>
			<div style={commonStyle.popupLayer}></div>
			<div style={commonStyle.popupContent} onClick={e => e.stopPropagation()}>
				<div style={commonStyle.popupContentLayer}></div>
				<div style={commonStyle.popupContentContainer}>
					<h3 style={commonStyle.title}>{title}</h3>

					<div style={commonStyle.popupContentInputs}>
						<input
							type="text"
							placeholder="Name"
							value={name}
							onChange={onNameChange}
							style={commonStyle.popupInput}
						/>
						<input
							type="text"
							placeholder="Description (optional)"
							value={text}
							onChange={onTextChange}
							style={commonStyle.popupInput}
						/>
					</div>

					<div style={commonStyle.popupButtons}>
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
				</div>
			</div>
		</div>
	);
}

export default TrainingPopup;