import React from 'react';
import { commonStyle } from '../../../../styles/commonStyle';
import { homeStyle } from '../homeStyles';

function DeleteConfirmationModal({ isOpen, trainingName, isLoading, onConfirm, onCancel }) {
	if (!isOpen) return null;

	return (
		<div style={commonStyle.popup} onClick={onCancel}>
			<div style={commonStyle.popupLayer}></div>
			<div style={commonStyle.popupContent} onClick={e => e.stopPropagation()}>
				<div style={commonStyle.popupContentLayer}></div>
				<div style={commonStyle.popupContentContainer}>
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
				</div>
			</div>
		</div>
	);
}

export default DeleteConfirmationModal;