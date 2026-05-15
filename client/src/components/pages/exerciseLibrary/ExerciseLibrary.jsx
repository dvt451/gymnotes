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
import SectionSkeleton from '../../widgets/Loading/SectionSkeleton';

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

	const libraryLoadingView = (
		<div style={styles.exerciseListBlock}>
			<div style={{ ...styles.muscleGroupsBlock, ...commonStyle.commonSection }}>
				<div style={styles.muscleGroupsHeader}>
					<div className="ui-skeleton" style={{ width: '34%', height: '24px' }}></div>
					<div className="ui-skeleton" style={{ width: '88px', height: '16px' }}></div>
				</div>
				<SectionSkeleton
					showHeader={false}
					cards={6}
					cardHeight={74}
					cardGap={10}
					columns="repeat(auto-fit, minmax(130px, 1fr))"
				/>
				<div style={styles.muscleGroupCreateRow}>
					<div className="ui-skeleton" style={{ flex: 1, height: '46px', borderRadius: '10px' }}></div>
					<div className="ui-skeleton" style={{ width: '120px', height: '46px', borderRadius: '10px' }}></div>
				</div>
			</div>

			<div style={{ ...commonStyle.commonSection, ...styles.exercisesListTitle }}>
				<div className="ui-skeleton" style={{ width: '30%', height: '24px' }}></div>
			</div>
			<SectionSkeleton
				showHeader={false}
				cards={4}
				cardHeight={76}
				cardGap={12}
				style={{ ...commonStyle.commonSection, marginBottom: '20px' }}
			/>
			<div className="ui-skeleton" style={{ height: '62px', borderRadius: '14px', marginTop: '20px' }}></div>
		</div>
	);

	return (
		<>
			<Gradient />
			<div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
				<Header />
				<main style={styles.container}>
					<div style={{ ...commonStyle.titleHeader, ...styles.exercisesHeader }}>
						<h2 style={commonStyle.title}>Exercise Library</h2>
					</div>
					{isLoading ? (
						libraryLoadingView
					) : (
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
					)}
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
			</div>
		</>
	);
}
