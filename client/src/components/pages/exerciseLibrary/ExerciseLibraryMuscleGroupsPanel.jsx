import React from 'react';
import { FaPen } from 'react-icons/fa';
import { isDefaultMuscleGroup } from './muscleGroups';

export default function ExerciseLibraryMuscleGroupsPanel({
	allMuscleGroupSections,
	commonStyle,
	customMuscleGroups,
	isCreatingMuscleGroup,
	muscleGroupError,
	muscleGroups,
	newMuscleGroupName,
	onCreateMuscleGroup,
	onMuscleGroupNameChange,
	onOpenRenameMuscleGroup,
	popupStyle,
	styles,
}) {
	return (
		<div style={{ ...styles.muscleGroupsBlock, ...commonStyle.commonSection, }}>
			<div style={styles.muscleGroupsHeader}>
				<h3 style={{ ...commonStyle.title, ...styles.exercisesListTitle, paddingTop: 0, paddingBottom: 0 }}>
					Muscle Groups
				</h3>
				<span style={styles.exerciseGroupCount}>
					{muscleGroups.length} group{muscleGroups.length !== 1 ? 's' : ''}
				</span>
			</div>
			<div style={styles.muscleGroupsList}>
				{allMuscleGroupSections.map(({ group, exercises }) => (
					<div key={group} style={styles.muscleGroupCard}>
						<div style={styles.muscleGroupCardHeader}>
							<strong style={styles.muscleGroupCardTitle}>{group}</strong>
							{customMuscleGroups.some(
								(item) => item.toLowerCase() === group.toLowerCase()
							) && !isDefaultMuscleGroup(group) && (
									<button
										type="button"
										style={styles.muscleGroupEditButton}
										onClick={() => onOpenRenameMuscleGroup(group)}
										aria-label={`Rename ${group}`}
									>
										<FaPen />
									</button>
								)}
						</div>
						<span style={styles.muscleGroupCardCount}>
							{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
						</span>
					</div>
				))}
			</div>
			<div style={styles.muscleGroupCreateRow}>
				<input
					type="text"
					style={popupStyle.popupInput}
					value={newMuscleGroupName}
					onChange={onMuscleGroupNameChange}
					placeholder="Create muscle group"
				/>
				<button
					type="button"
					style={styles.muscleGroupCreateButton}
					onClick={onCreateMuscleGroup}
					disabled={!newMuscleGroupName.trim() || isCreatingMuscleGroup}
				>
					{isCreatingMuscleGroup ? 'Saving...' : 'Add Group'}
				</button>
			</div>
			{muscleGroupError && (
				<p style={{ ...styles.error, marginTop: '12px', marginBottom: 0 }}>
					{muscleGroupError}
				</p>
			)}
		</div>
	);
}
