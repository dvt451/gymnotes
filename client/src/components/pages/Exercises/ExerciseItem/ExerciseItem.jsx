import React, { useContext, useState } from 'react';
import { createExercisesStyles } from '../ExersicesStyles';
import Weights from './Weights/Weights';
import DeleteExerciseItem from './DeleteExerciseItem';
import Popup from '../../../widgets/Popup';
import { GlobalContext } from '../../../../context/GlobalContext';
import { createCommonStyle } from '../../../../styles/commonStyle';
import { getToken } from '../../../utils/getToken';
import { FaPen } from 'react-icons/fa';
import { createPopupStyle } from '../../../widgets/popupStyle';
import MuscleGroupSelect from '../../../widgets/MuscleGroupSelect';
import { normalizeExerciseMuscleGroup } from '../../exerciseLibrary/muscleGroups';
import ExerciseItemMove from './ExerciseItemMove';
import ExerciseCurrentCommentSection from './ExerciseCurrentCommentSection';
import PreviousData from './PreviousData';

export default function ExerciseItem({
	item,
	setExercises,
	date,
	trainingId,
	BASE_URL,
	expandedExerciseId,
	setExpandedExerciseId,
	setIsCommentEditingId,
	isCommentEditingId,
	editState,
	isReordering = false,
	index = 0,
	exercisesCount = 0,
	moveExerciseInList = () => { },
	isSavingOrder = false,
	isPreviousHistoryLoading = false,
	prevHistoryEntries = [],
	prevWeights = [],
	prevComment = '',
	previousDate = '',
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);
	const [showRenamePopup, setShowRenamePopup] = useState(false);
	const [renameValue, setRenameValue] = useState(item.name || '');
	const [renameMuscleGroup, setRenameMuscleGroup] = useState(
		normalizeExerciseMuscleGroup(item.muscleGroup)
	);
	const [renameError, setRenameError] = useState('');
	const [isRenaming, setIsRenaming] = useState(false);
	const popupStyle = createPopupStyle(mainColor);

	const toggleExpand = (e) => {
		e.stopPropagation();
		if (isReordering) return;
		if (expandedExerciseId === item._id) return;
		setExpandedExerciseId(item._id);
		setIsCommentEditingId(false);
	};

	const isExpanded = expandedExerciseId === item._id;

	const openRenamePopup = (e) => {
		e.stopPropagation();
		setRenameValue(item.name || '');
		setRenameMuscleGroup(normalizeExerciseMuscleGroup(item.muscleGroup));
		setRenameError('');
		setShowRenamePopup(true);
	};

	const closeRenamePopup = () => {
		setShowRenamePopup(false);
		setRenameMuscleGroup(normalizeExerciseMuscleGroup(item.muscleGroup));
		setRenameError('');
	};

	const submitRename = async () => {
		const nextName = (renameValue || '').trim();
		if (!nextName) return;

		setIsRenaming(true);
		setRenameError('');

		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${item._id}`;
			const response = await fetch(url, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: nextName,
					muscleGroup: renameMuscleGroup,
				}),
			});

			const data = (response.headers.get('content-type') || '').includes('application/json')
				? await response.json()
				: {};

			if (!response.ok) {
				setRenameError(data?.message || 'Не удалось переименовать упражнение');
				return;
			}

			setExercises((prev) =>
				prev.map((ex) =>
					String(ex._id || ex.id) === String(item._id || item.id)
						? { ...ex, ...data, name: data?.name || nextName }
						: ex
				)
			);
			setShowRenamePopup(false);
		} catch (err) {
			setRenameError(err.message || 'Не удалось переименовать упражнение');
		} finally {
			setIsRenaming(false);
		}
	};

	return (
		<div style={{ display: 'flex', gap: '10px', position: 'relative' }} >
			<div
				style={{ ...styles.exerciseBlock, width: '100%', ...(!isExpanded && { cursor: 'pointer' }) }}
				onClick={toggleExpand}
			>

				<div style={styles.exerciseHeader}>
					<span style={styles.exerciseNumber}>{index + 1}</span>
					<div
						style={{
							...styles.exerciseTitle,
							...(isExpanded && styles.exerciseTitleActive),
						}}
					>
						{item.name}
					</div>



					{editState && isExpanded && !isReordering && (
						<button
							type="button"
							onClick={openRenamePopup}
							style={{ ...styles.deleteExerciseBtn, color: '#00C8FF' }}
							aria-label="Переименовать упражнение"
							title="Переименовать"
						>
							<FaPen />
						</button>
					)}

					{editState && isExpanded && !isReordering && (
						<DeleteExerciseItem
							item={item}
							setExercises={setExercises}
							date={date}
							trainingId={trainingId}
							BASE_URL={BASE_URL}
						/>
					)}
				</div>
				<PreviousData
					item={item}
					setExercises={setExercises}
					date={date}
					trainingId={trainingId}
					BASE_URL={BASE_URL}
					isExpanded={isExpanded}
					isReordering={isReordering}
					prevHistoryEntries={prevHistoryEntries}
					prevWeights={prevWeights}
					prevComment={prevComment}
					previousDate={previousDate}
					isPreviousHistoryLoading={isPreviousHistoryLoading}
				/>

				<Weights
					editState={editState}
					item={item}
					setExercises={setExercises}
					date={date}
					trainingId={trainingId}
					BASE_URL={BASE_URL}
					isExpanded={isExpanded && !isReordering}
				/>
				<ExerciseCurrentCommentSection
					item={item}
					setExercises={setExercises}
					date={date}
					trainingId={trainingId}
					BASE_URL={BASE_URL}
					isExpanded={isExpanded}
					isReordering={isReordering}
					setIsCommentEditingId={setIsCommentEditingId}
					setExpandedExerciseId={setExpandedExerciseId}
					isCommentEditingId={isCommentEditingId}
				/>
				<Popup isOpen={showRenamePopup} onClose={closeRenamePopup}>
					<h2 style={popupStyle.title}>Rename Exercise</h2>
					<div style={popupStyle.popupBodyContent}>
						<input
							type="text"
							style={popupStyle.popupInput}
							value={renameValue}
							onChange={(e) => {
								setRenameError('');
								setRenameValue(e.target.value);
							}}
							placeholder="Новое название"
							autoFocus
						/>
						<MuscleGroupSelect
							style={popupStyle.popupInput}
							value={renameMuscleGroup}
							onChange={setRenameMuscleGroup}
							disabled={isRenaming}
						/>
					</div>
					{renameError && (
						<p style={{ ...styles.error, margin: 0, padding: '8px' }}>{renameError}</p>
					)}
					<div style={commonStyle.popupButtons}>
						<button
							type="button"
							style={commonStyle.popupCreateButton}
							onClick={submitRename}
							disabled={!renameValue.trim() || isRenaming}
						>
							{isRenaming ? 'Сохранение...' : 'Сохранить'}
						</button>
						<button
							type="button"
							style={commonStyle.popupCancelButton}
							onClick={closeRenamePopup}
							disabled={isRenaming}
						>
							Отмена
						</button>
					</div>
				</Popup>
			</div>
			{editState && isReordering && (
				<ExerciseItemMove
					index={index}
					exercisesCount={exercisesCount}
					moveExerciseInList={moveExerciseInList}
					disabled={isSavingOrder}
				/>
			)}
		</ div>
	);
}
