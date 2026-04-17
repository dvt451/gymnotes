import React, { useContext, useEffect, useState } from 'react';
import { FaCheck, FaPen } from 'react-icons/fa';
import { GlobalContext } from '../../../../context/GlobalContext';
import { createExercisesStyles } from '../ExersicesStyles';
import { getToken } from '../../../utils/getToken';

export default function ExerciseCurrentCommentSection({
	item,
	setExercises,
	date,
	trainingId,
	BASE_URL,
	itemId,
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
		setIsCommentEditingId(false);
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
			}
		}

		if (e.key === 'Escape') {
			setCommentValue(item.comment || '');
			setCommentError('');
			setIsCommentEditingId(false);
		}
	};

	if (!(normalizedCurrentComment || canEditComment)) {
		return null;
	}

	return (
		<div
			style={styles.exerciseCommentSection}
		>
			<div style={styles.exerciseCommentRow}>
				{isCommentEditingId ? (
					<>
						<input
							type="text"
							value={commentValue}
							onChange={(e) => {
								setCommentError('');
								setCommentValue(e.target.value);
							}}
							onKeyDown={handleKeyDown}
							placeholder="Comment"
							style={styles.exerciseCommentInput}
							maxLength={1000}
							disabled={isSavingComment}
							autoFocus
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
						>
							<FaCheck />
						</button>
					</>
				) : (
					<>
						<button
							type="button"
							style={styles.exerciseCommentDisplayButton}
							title={canEditComment ? 'Edit comment' : undefined}
						>
							<span
								style={
									normalizedCurrentComment
										? styles.exerciseCommentText
										: styles.exerciseCommentPlaceholder
								}
							>
								{normalizedCurrentComment || 'Empty'}
							</span>
						</button>
						{canEditComment && (
							<button
								type="button"
								onClick={handleStartEditing}
								style={{
									...styles.exerciseCommentIconButton,
									...styles.exerciseCommentEditButton,
								}}
								aria-label="Edit comment"
								title="Edit comment"
							>
								<FaPen />
							</button>
						)}
					</>
				)}
			</div>
			{commentError && <p style={styles.exerciseCommentError}>{commentError}</p>}
		</div >
	);
}
