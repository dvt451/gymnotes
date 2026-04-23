import React from 'react';
import ExerciseLibraryItem from './ExerciseLibraryItem';

export default function ExerciseLibraryListSection({
	commonStyle,
	deletingExerciseId,
	error,
	groupedUserExercises,
	isLoading,
	onDeleteExercise,
	onRenameExercise,
	renamingExerciseId,
	styles,
	userExercises,
}) {
	return (
		<>
			<div style={{ ...commonStyle.commonSection, ...styles.exercisesListTitle }}><h3 style={commonStyle.title}>User Library</h3></div>
			{isLoading && <p style={styles.noExercises}>Loading...</p>}
			{error && <p style={styles.error}>{error}</p>}
			<div style={styles.exercisesList}>
				{!isLoading && !error && userExercises.length === 0 && (
					<p style={styles.noExercises}>You have no exercises yet</p>
				)}
				{groupedUserExercises.map(({ group, exercises }) => (
					<section key={group} style={{ ...styles.exerciseGroupSection, ...commonStyle.commonSection }}>
						<div style={styles.exerciseGroupHeader}>
							<h4 style={styles.exerciseGroupTitle}>{group}</h4>
							<span style={styles.exerciseGroupCount}>
								{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
							</span>
						</div>
						{exercises.map((item) => (
							<ExerciseLibraryItem
								key={item._id || item.id || item.name}
								name={item.name}
								muscleGroup={item.muscleGroup}
								onRename={() => onRenameExercise(item)}
								onDelete={() => onDeleteExercise(item)}
								isRenaming={renamingExerciseId === String(item._id || item.id)}
								isDeleting={deletingExerciseId === String(item._id || item.id)}
							/>
						))}
					</section>
				))}
			</div>
		</>
	);
}
