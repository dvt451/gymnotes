import React, { useContext, useState } from 'react';
import { createExercisesStyles } from '../ExersicesStyles';
import Weights from './Weights/Weights';
import DeleteExerciseItem from './DeleteExerciseItem';
import { GlobalContext } from '../../../../context/GlobalContext';
import { createCommonStyle } from '../../../../styles/commonStyle';
import { getToken } from '../../../utils/getToken';
import { FaPen } from 'react-icons/fa';
import PrevWeights from './PrevWeights';

export default function ExerciseItem({
	item,
	setExercises,
	date,
	trainingId,
	BASE_URL,
	expandedExerciseId,
	setExpandedExerciseId,
	editState,
	prevWeights = [],
	previousDate = '',
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);
	const [showRenamePopup, setShowRenamePopup] = useState(false);
	const [renameValue, setRenameValue] = useState(item.name || '');
	const [renameError, setRenameError] = useState('');
	const [isRenaming, setIsRenaming] = useState(false);

	const toggleExpand = (e) => {
		e.stopPropagation();
		if (expandedExerciseId === item._id) return;
		setExpandedExerciseId(item._id);
	};

	const isExpanded = expandedExerciseId === item._id;

	const openRenamePopup = (e) => {
		e.stopPropagation();
		setRenameValue(item.name || '');
		setRenameError('');
		setShowRenamePopup(true);
	};

	const closeRenamePopup = () => {
		setShowRenamePopup(false);
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
				body: JSON.stringify({ name: nextName }),
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
		<div
			style={{ ...styles.exerciseBlock, ...(!isExpanded && { cursor: 'pointer' }) }}
			onClick={toggleExpand}
		>
			<div style={styles.exerciseHeader}>
				<div
					style={{
						...styles.exerciseTitle,
						...(isExpanded && styles.exerciseTitleActive),
					}}
				>
					{item.name}
				</div>

				{editState && isExpanded && (
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

				{editState && isExpanded && (
					<DeleteExerciseItem
						item={item}
						setExercises={setExercises}
						date={date}
						trainingId={trainingId}
						BASE_URL={BASE_URL}
					/>
				)}
			</div>

			<PrevWeights weights={prevWeights} previousDate={previousDate} />
			<Weights
				editState={editState}
				item={item}
				setExercises={setExercises}
				date={date}
				trainingId={trainingId}
				BASE_URL={BASE_URL}
				isExpanded={isExpanded}
			/>

			{showRenamePopup && (
				<div style={commonStyle.popup} onClick={closeRenamePopup}>
					<div style={commonStyle.popupLayer} />
					<div style={commonStyle.popupContent} onClick={(e) => e.stopPropagation()}>
						<div style={commonStyle.popupContentLayer} />
						<div style={commonStyle.popupContentContainer}>
							<h3 style={{ textAlign: 'center', margin: 0 }}>Переименовать упражнение</h3>
							<div style={commonStyle.popupContentInputs}>
								<input
									type="text"
									style={commonStyle.popupInput}
									value={renameValue}
									onChange={(e) => {
										setRenameError('');
										setRenameValue(e.target.value);
									}}
									placeholder="Новое название"
									autoFocus
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
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
