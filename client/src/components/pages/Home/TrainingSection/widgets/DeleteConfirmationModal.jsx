import React, { useContext } from 'react';
import { createCommonStyle } from '../../../../../styles/commonStyle';
import { createHomeStyle } from '../../homeStyles';
import { GlobalContext } from '../../../../../context/GlobalContext';
import Popup from '../../../../widgets/Popup';
import { createPopupStyle } from '../../../../widgets/popupStyle';

function DeleteConfirmationModal({ isOpen, trainingName, isLoading, onConfirm, onCancel }) {
	const { mainColor } = useContext(GlobalContext);

	const homeStyle = createHomeStyle(mainColor);
	const commonStyle = createCommonStyle(mainColor);
	const popupStyle = createPopupStyle(mainColor);

	return (
		<Popup isOpen={isOpen} onClose={onCancel}>
			<h3 style={popupStyle.title}>Confirm Deletion</h3>
			<p style={{ color: '#fff' }}>Delete training "{trainingName}"?</p>
			<p style={{ color: 'red', fontSize: '14px' }}>
				This action cannot be undone.
			</p>

			<div style={popupStyle.popupButtons}>
				<button
					onClick={onCancel}
					style={{ ...commonStyle.button, ...commonStyle.popupCancelButton }}
				>
					Cancel
				</button>
				<button
					onClick={onConfirm}
					style={{ ...commonStyle.button, ...commonStyle.popupDeleteButton }}
					disabled={isLoading}
				>
					{isLoading ? 'Deleting...' : 'Delete'}
				</button>
			</div>
		</Popup>
	);
}

export default DeleteConfirmationModal;
