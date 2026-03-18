import React, { useContext } from 'react';
import { GlobalContext } from '../../../context/GlobalContext';
import { createExercisesStyles } from './ExersicesStyles';
import { FaTrash } from 'react-icons/fa';
import { FaPen } from 'react-icons/fa';

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
						<button
							type="button"
							onClick={onDelete}
							style={styles.deleteExerciseBtn}
							disabled={isDeleting || isRenaming}
							aria-label="Delete exercise globally"
							title="Delete globally"
						>
							<FaTrash />
						</button>
					)}
				</div>
			</div>
		</div>
	);
}
