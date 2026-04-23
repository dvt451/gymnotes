import React from 'react';
import Popup from '../../widgets/Popup';
import LoadingButton from '../../widgets/LoadingButton';

export default function RenameMuscleGroupPopup({
	commonStyle,
	isOpen,
	isRenaming,
	onClose,
	onRename,
	onRenameValueChange,
	popupStyle,
	renameError,
	renameValue,
	styles,
}) {
	return (
		<Popup isOpen={isOpen} onClose={onClose}>
			<h3 style={{ textAlign: 'center', margin: 0 }}>Rename Muscle Group</h3>
			<input
				type="text"
				style={popupStyle.popupInput}
				value={renameValue}
				onChange={onRenameValueChange}
				placeholder="New muscle group name"
				autoFocus
			/>
			{renameError && (
				<p style={{ ...styles.error, margin: 0, padding: '8px' }}>
					{renameError}
				</p>
			)}
			<div style={commonStyle.popupButtons}>
				<LoadingButton
					type="button"
					style={commonStyle.popupCreateButton}
					onClick={onRename}
					isLoading={isRenaming}
					loadingLabel="Saving..."
					disabled={!renameValue.trim() || isRenaming}
				>
					Save
				</LoadingButton>
				<button
					type="button"
					style={commonStyle.popupCancelButton}
					onClick={onClose}
					disabled={isRenaming}
				>
					Cancel
				</button>
			</div>
		</Popup>
	);
}
