import React, { useContext } from 'react';
import { createCommonStyle } from '../../../../styles/commonStyle';
import { createHomeStyle } from '../homeStyles';
import { GlobalContext } from '../../../../context/GlobalContext';
import Popup from '../../../widgets/Popup';

function DeleteConfirmationModal({ isOpen, trainingName, isLoading, onConfirm, onCancel }) {
	const { mainColor } = useContext(GlobalContext);

	const homeStyle = createHomeStyle(mainColor);
	const commonStyle = createCommonStyle(mainColor);

	return (
		<Popup isOpen={isOpen} onClose={onCancel}>
			<h3 style={commonStyle.title}>Confirm Deletion</h3>
			<p>Delete training "{trainingName}"?</p>
			<p style={{ color: 'red', fontSize: '14px' }}>
				This action cannot be undone.
			</p>

			<div style={homeStyle.popupButtons}>
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
