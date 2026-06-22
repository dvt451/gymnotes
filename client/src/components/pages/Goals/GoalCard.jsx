import React, { useContext, useMemo } from 'react';
import { GlobalContext } from '../../../context/GlobalContext';
import { createGoalsStyles } from './GoalsStyles';

export default function GoalCard({ goal, onDelete }) {
	const { mainColor } = useContext(GlobalContext);
	const goalsStyles = useMemo(() => createGoalsStyles(mainColor), [mainColor]);

	return (
		<div style={goalsStyles.goalCard}>
			{/* Goal Header */}
			<div style={goalsStyles.goalHeader}>
				<div>
					<h3 style={goalsStyles.goalTitle}>{goal.exerciseName}</h3>
					<p style={goalsStyles.metaLabel}>
						{goal.notes || 'Track matching training entries against this goal.'}
					</p>
				</div>
				<span
					style={{
						...goalsStyles.statusBadge,
						backgroundColor: goal.progress.isAchieved ? '#92E33C33' : '#FFCC0033',
						color: goal.progress.isAchieved ? '#92E33C' : '#FFCC00',
					}}
				>
					{goal.progress.isAchieved ? 'Achieved' : 'In progress'}
				</span>
			</div>

			{/* Goal Metadata */}
			<div style={goalsStyles.goalMeta}>
				<div style={goalsStyles.metaItem}>
					<span style={goalsStyles.metaLabel}>Target</span>
					<strong style={goalsStyles.metaValue}>
						{`${goal.targetWeight} kg × ${goal.targetSets} sets${goal.targetReps > 0 ? ` × ${goal.targetReps} reps` : ''
							}`}
					</strong>
				</div>
				<div style={goalsStyles.metaItem}>
					<span style={goalsStyles.metaLabel}>Progress</span>
					<strong style={goalsStyles.metaValue}>
						{`${goal.progress.matchedSets}/${goal.progress.targetSets} sets`}
					</strong>
				</div>
			</div>

			{/* Progress Bar */}
			<div style={goalsStyles.progressBar}>
				<div
					style={{
						...goalsStyles.progressFill,
						width: `${goal.progress.progressPercent}%`,
					}}
				/>
			</div>

			{/* Best Matching Weight */}
			<div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
				<div style={{ ...goalsStyles.metaItem, width: '100%' }}>
					<span style={goalsStyles.metaLabel}>Best matching weight</span>
					<strong style={goalsStyles.metaValue}>
						{goal.progress.highestWeight ? `${goal.progress.highestWeight} kg` : 'Not met yet'}
					</strong>
				</div>
			</div>

			{/* Achieved Date */}
			{goal.progress.achievedAt && (
				<p style={{ opacity: 0.75, margin: 0 }}>
					Achieved on {new Date(goal.progress.achievedAt).toLocaleDateString()}
				</p>
			)}

			{/* Delete Button */}
			<div style={goalsStyles.actionRow}>
				<button
					type="button"
					style={goalsStyles.deleteButton}
					onClick={() => onDelete(goal._id)}
				>
					Delete goal
				</button>
			</div>
		</div>
	);
}
