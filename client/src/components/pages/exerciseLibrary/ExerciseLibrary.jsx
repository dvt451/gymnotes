import React, { useContext } from 'react';
import Footer from '../../widgets/Footer';
import Header from '../../widgets/Header';
import { createExercisesStyles } from './ExersicesStyles';
import { GlobalContext } from '../../../context/GlobalContext';
import { createCommonStyle } from '../../../styles/commonStyle';
import CreateExerciseButton from './CreateExerciseButton';
import { AuthContext } from '../../../context/AuthContext';
import { createPopupStyle } from '../../widgets/popupStyle';
import ExerciseLibraryListSection from './ExerciseLibraryListSection';
import ExerciseLibraryMuscleGroupsPanel from './ExerciseLibraryMuscleGroupsPanel';
import RenameExercisePopup from './RenameExercisePopup';
import RenameMuscleGroupPopup from './RenameMuscleGroupPopup';
import { useExerciseLibraryManager } from './useExerciseLibraryManager';
import Gradient from '../../widgets/Gradient';

export default function ExerciseLibrary() {
	const { mainColor } = useContext(GlobalContext);
	const { BASE_URL } = useContext(AuthContext);
	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);
	const popupStyle = createPopupStyle(mainColor);
	const {
		allMuscleGroupSections,
		closeRenameModal,
		closeRenameMuscleGroupModal,
		customMuscleGroups,
		deletingExerciseId,
		error,
		groupedUserExercises,
		handleCreateExercise,
		handleCreateMuscleGroup,
		handleDeleteExercise,
		handleRenameExercise,
		handleRenameMuscleGroup,
		isCreatingMuscleGroup,
		isLoading,
		isRenamingMuscleGroup,
		muscleGroupError,
		muscleGroups,
		newMuscleGroupName,
		openRenameModal,
		openRenameMuscleGroupModal,
		renameError,
		renameModalVisible,
		renameMuscleGroup,
		renameMuscleGroupError,
		renameMuscleGroupModalVisible,
		renameMuscleGroupValue,
		renameValue,
		renamingExerciseId,
		setMuscleGroupError,
		setNewMuscleGroupName,
		setRenameMuscleGroup,
		setRenameMuscleGroupValue,
		setRenameValue,
		userExercises,
	} = useExerciseLibraryManager(BASE_URL);

	return (
		<>
			<Gradient />
			<div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
				<Header />
				<main style={styles.container}>
					<div style={{ ...commonStyle.titleHeader, ...styles.exercisesHeader }}>
						<h2 style={commonStyle.title}>Exercise Library</h2>
					</div>
					<div style={styles.exerciseListBlock}>
						<ExerciseLibraryMuscleGroupsPanel
							allMuscleGroupSections={allMuscleGroupSections}
							commonStyle={commonStyle}
							customMuscleGroups={customMuscleGroups}
							isCreatingMuscleGroup={isCreatingMuscleGroup}
							muscleGroupError={muscleGroupError}
							muscleGroups={muscleGroups}
							newMuscleGroupName={newMuscleGroupName}
							onCreateMuscleGroup={handleCreateMuscleGroup}
							onMuscleGroupNameChange={(e) => {
								setMuscleGroupError('');
								setNewMuscleGroupName(e.target.value);
							}}
							onOpenRenameMuscleGroup={openRenameMuscleGroupModal}
							popupStyle={popupStyle}
							styles={styles}
						/>

						<ExerciseLibraryListSection
							commonStyle={commonStyle}
							deletingExerciseId={deletingExerciseId}
							error={error}
							groupedUserExercises={groupedUserExercises}
							isLoading={isLoading}
							onDeleteExercise={handleDeleteExercise}
							onRenameExercise={openRenameModal}
							renamingExerciseId={renamingExerciseId}
							styles={styles}
							userExercises={userExercises}
						/>

						<CreateExerciseButton
							existingExercises={userExercises}
							onCreateExercise={handleCreateExercise}
							muscleGroups={muscleGroups}
						/>
					</div>
				</main>

				<RenameExercisePopup
					commonStyle={commonStyle}
					isOpen={renameModalVisible}
					isRenaming={Boolean(renamingExerciseId)}
					muscleGroups={muscleGroups}
					onClose={closeRenameModal}
					onRename={handleRenameExercise}
					onRenameMuscleGroupChange={setRenameMuscleGroup}
					onRenameValueChange={(e) => setRenameValue(e.target.value)}
					popupStyle={popupStyle}
					renameError={renameError}
					renameMuscleGroup={renameMuscleGroup}
					renameValue={renameValue}
					styles={styles}
				/>
				<RenameMuscleGroupPopup
					commonStyle={commonStyle}
					isOpen={renameMuscleGroupModalVisible}
					isRenaming={isRenamingMuscleGroup}
					onClose={closeRenameMuscleGroupModal}
					onRename={handleRenameMuscleGroup}
					onRenameValueChange={(e) => setRenameMuscleGroupValue(e.target.value)}
					popupStyle={popupStyle}
					renameError={renameMuscleGroupError}
					renameValue={renameMuscleGroupValue}
					styles={styles}
				/>
				<Footer />
			</div >

		</>
	);
}
