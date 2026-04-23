import React from 'react';
import Popup from '../../widgets/Popup';
import MuscleGroupSelect from '../../widgets/MuscleGroupSelect';
import LoadingButton from '../../widgets/LoadingButton';

export default function RenameExercisePopup({
	commonStyle,
	isRenaming,
	isOpen,
	muscleGroups,
	onClose,
	onRename,
	onRenameMuscleGroupChange,
	onRenameValueChange,
	popupStyle,
	renameError,
	renameMuscleGroup,
	renameValue,
	styles,
}) {
	return (
		<Popup isOpen={isOpen} onClose={onClose}>
			<h3 style={{ textAlign: 'center', margin: 0 }}>Rename Exercise</h3>
			<div style={popupStyle.popupContentInputs}>
				<input
					type="text"
					style={popupStyle.popupInput}
					value={renameValue}
					onChange={onRenameValueChange}
					placeholder="New name"
					autoFocus
				/>
				<MuscleGroupSelect
					style={popupStyle.popupInput}
					value={renameMuscleGroup}
					onChange={onRenameMuscleGroupChange}
					options={muscleGroups}
					disabled={isRenaming}
				/>
			</div>
			{renameError && (
				<p style={{ ...styles.error, margin: 0, padding: '8px' }}>{renameError}</p>
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
