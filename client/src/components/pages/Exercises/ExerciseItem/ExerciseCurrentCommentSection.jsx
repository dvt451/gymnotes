import React, { useContext, useEffect, useState } from 'react';
import { FaCheck, FaPen } from 'react-icons/fa';
import { GlobalContext } from '../../../../context/GlobalContext';
import { createExercisesStyles } from '../ExersicesStyles';
import { getToken } from '../../../utils/getToken';
import InlineSpinner from '../../../widgets/InlineSpinner';
import { BiMessageAdd } from "react-icons/bi";
import { colors, toRem } from '../../../../styles/commonStyle';

export default function ExerciseCurrentCommentSection({
	item,
	setExercises,
	date,
	trainingId,
	BASE_URL,
	isExpanded,
	isReordering,
	isCommentEditingId,
	setIsCommentEditingId
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);
	const [commentValue, setCommentValue] = useState(item.comment || '');
	const [commentError, setCommentError] = useState('');
	const [isSavingComment, setIsSavingComment] = useState(false);

	useEffect(() => {
		setCommentValue(item.comment || '');
		setCommentError('');
		setIsSavingComment(false);
		// Не сбрасываем isCommentEditingId здесь, чтобы не закрывать инпут при обновлении
	}, [item._id, item.comment]);

	const submitComment = async () => {
		setIsSavingComment(true);
		setCommentError('');
		try {
			const token = await getToken();
			const url = `${BASE_URL}/api/trainings/${trainingId}/dates/${date}/exercises/${item._id}/comment`;
			const response = await fetch(url, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					comment: commentValue,
				}),
			});

			const data = (response.headers.get('content-type') || '').includes('application/json')
				? await response.json()
				: {};

			if (!response.ok) {
				setCommentError(data?.message || 'Failed to save comment');
				return;
			}

			setExercises((prev) =>
				prev.map((ex) =>
					String(ex._id || ex.id) === String(item._id || item.id)
						? { ...ex, ...data, comment: data?.comment ?? commentValue.trim() }
						: ex
				)
			);
			setIsCommentEditingId(false);
		} catch (err) {
			setCommentError(err.message || 'Failed to save comment');
		} finally {
			setIsSavingComment(false);
		}
	};

	const handleCancelEdit = () => {
		setCommentValue(item.comment || '');
		setCommentError('');
		setIsCommentEditingId(false);
	};

	const normalizedCurrentComment = (item.comment || '').trim();
	const hasCommentChanges = commentValue.trim() !== normalizedCurrentComment;
	const canEditComment = isExpanded && !isReordering;

	const handleStartEditing = () => {
		if (!canEditComment) return;
		setCommentValue(item.comment || '');
		setCommentError('');
		setIsCommentEditingId(item._id);
	};

	const handleKeyDown = (e) => {
		if (e.key === 'Enter') {
			e.preventDefault();
			if (hasCommentChanges && !isSavingComment) {
				submitComment();
			} else if (!hasCommentChanges) {
				// Если нет изменений, просто закрываем редактирование
				setIsCommentEditingId(false);
			}
		}

		if (e.key === 'Escape') {
			e.preventDefault();
			handleCancelEdit();
		}
	};

	// Не показываем компонент, если нет комментария и нельзя редактировать
	if (!(normalizedCurrentComment || canEditComment)) {
		return null;
	}

	return (
		<div style={styles.exerciseCommentSection}>
			<div style={styles.exerciseCommentRow}>
				{isCommentEditingId === item._id ? (
					<>
						<input
							type="text"
							value={commentValue}
							onChange={(e) => {
								setCommentError('');
								setCommentValue(e.target.value);
							}}
							onKeyDown={handleKeyDown}
							onBlur={() => {
								// При потере фокуса (нажатие Done на мобильной клавиатуре)
								if (isCommentEditingId === item._id && !isSavingComment) {
									if (hasCommentChanges) {
										submitComment();
									} else {
										handleCancelEdit();
									}
								}
							}}
							placeholder="Comment"
							style={styles.exerciseCommentInput}
							maxLength={1000}
							disabled={isSavingComment}
							autoFocus
							enterKeyHint="done"
						/>
						<button
							type="button"
							onClick={submitComment}
							style={{
								...styles.exerciseCommentIconButton,
								...styles.exerciseCommentConfirmButton,
							}}
							aria-label="Save comment"
							title="Save comment"
							disabled={isSavingComment}
						>
							{isSavingComment ? (
								<InlineSpinner size={14} thickness={2} color="#FFFFFF" />
							) : (
								<FaCheck />
							)}
						</button>
					</>
				) : (
					<>
						{canEditComment && !normalizedCurrentComment && (
							<button
								type="button"
								onClick={handleStartEditing}
								style={{
									...styles.exerciseCommentEditButton,
								}}
								aria-label="Edit comment"
								title="Edit comment"
							>
								<FaPen />
								<span>Add Note</span>
							</button>
						)}
						{normalizedCurrentComment && <button
							type="button"
							onClick={canEditComment ? handleStartEditing : undefined}
							style={{
								...styles.exerciseCommentDisplayButton,
								cursor: canEditComment ? 'pointer' : 'default',

							}}
							title={canEditComment ? 'Edit comment' : undefined}
						>
							<span
								style={{
									display: 'flex',
									alignItems: 'center',
									justifyContent: 'center',
									borderRadius: '50%',
									width: toRem(40),
									height: toRem(40),
									backgroundColor: colors.green + 30,
									color: colors.green,
								}}
							><BiMessageAdd style={{ fontSize: toRem(20), marginTop: toRem(3) }} />
							</span>
							<div>
								<p style={styles.exerciseCommentTitle}>Current note</p>
								<p
									style={
										normalizedCurrentComment
											? styles.exerciseCommentText
											: styles.exerciseCommentPlaceholder
									}
								>
									{normalizedCurrentComment}
								</p>
							</div>
						</button>}
					</>
				)}
			</div>
			{commentError && <p style={styles.exerciseCommentError}>{commentError}</p>}
		</div>
	);
}
