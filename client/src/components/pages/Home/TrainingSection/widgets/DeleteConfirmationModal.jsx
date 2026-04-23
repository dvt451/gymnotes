import React, { useContext } from 'react';
import { createCommonStyle } from '../../../../../styles/commonStyle';
import { createHomeStyle } from '../../homeStyles';
import { GlobalContext } from '../../../../../context/GlobalContext';
import Popup from '../../../../widgets/Popup';
import { createPopupStyle } from '../../../../widgets/popupStyle';
import LoadingButton from '../../../../widgets/LoadingButton';

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
				<LoadingButton
					onClick={onConfirm}
					style={{ ...commonStyle.button, ...commonStyle.popupDeleteButton }}
					isLoading={isLoading}
					loadingLabel="Deleting..."
					disabled={isLoading}
				>
					Delete
				</LoadingButton>
			</div>
		</Popup>
	);
}

export default DeleteConfirmationModal;
