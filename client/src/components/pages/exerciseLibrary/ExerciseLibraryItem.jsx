import React, { useContext, useState } from 'react';
import { GlobalContext } from '../../../context/GlobalContext';
import { createExercisesStyles } from './ExersicesStyles';
import { FaTrash } from 'react-icons/fa';
import { FaPen } from 'react-icons/fa';
import Popup from '../../widgets/Popup';
import { createPopupStyle } from '../../widgets/popupStyle';

export default function ExerciseLibraryItem({
	name,
	muscleGroup,
	onRename,
	onDelete,
	isRenaming = false,
	isDeleting = false,
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const [showDeletePopup, setShowDeletePopup] = useState(false);
	const popupStyle = createPopupStyle(mainColor);

	return (
		<div style={styles.exerciseBlock}>
			<div style={styles.exerciseHeader}>
				<div style={styles.exerciseContent}>
					<div style={styles.exerciseTitle}>{name}</div>
					<div style={styles.muscleGroupBadge}>{muscleGroup}</div>
				</div>
				<div style={styles.exerciseActions}>
					{typeof onRename === 'function' && (
						<button
							type="button"
							onClick={onRename}
							style={{ ...styles.deleteExerciseBtn, color: '#00C8FF' }}
							disabled={isRenaming || isDeleting}
							aria-label="Rename exercise globally"
							title="Rename globally"
						>
							<FaPen />
						</button>
					)}
					{typeof onDelete === 'function' && (
						<>
							<button
								type="button"
								onClick={() => setShowDeletePopup(true)}
								style={styles.deleteExerciseBtn}
								disabled={isDeleting || isRenaming}
								aria-label="Delete exercise globally"
								title="Delete globally"
							>
								<FaTrash />
							</button>

							<Popup isOpen={showDeletePopup} onClose={() => setShowDeletePopup(false)}>
								<h3 style={popupStyle.title}>Confirm Deletion</h3>
								<p style={{ color: '#fff' }}>Delete "{name}" from the global library?</p>
								<div style={popupStyle.popupButtons}>
									<button
										onClick={() => setShowDeletePopup(false)}
										style={popupStyle.popupCancelButton}
									>
										Cancel
									</button>
									<button
										onClick={async () => {
											if (typeof onDelete === 'function') await onDelete();
											setShowDeletePopup(false);
										}}
										style={popupStyle.popupDeleteButton}
										disabled={isDeleting || isRenaming}
									>
										Delete
									</button>
								</div>
							</Popup>
						</>
					)}
				</div>
			</div>
		</div>
	);
}
