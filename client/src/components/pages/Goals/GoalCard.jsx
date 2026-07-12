import React, { useContext, useMemo } from 'react';
import { GlobalContext } from '../../../context/GlobalContext';
import { createGoalsStyles } from './GoalsStyles';
import { colors } from '../../../styles/commonStyle';

export default function GoalCard({ goal, onDelete }) {
	const { mainColor } = useContext(GlobalContext);
	const goalsStyles = useMemo(() => createGoalsStyles(mainColor), [mainColor]);
	const currentWeight = Number(goal.progress?.highestWeight ?? 0);
	const currentReps = Number(goal.progress?.matchedReps ?? goal.progress?.matchedSets ?? 0);
	const weightProgressPercent = goal.progress?.weightProgressPercent ?? goal.progress?.progressPercent ?? 0;
	const targetWeight = Number(goal.targetWeight ?? 0);
	const targetReps = goal.targetSets;

	const weightAchieved = currentWeight >= targetWeight;
	const weightAboveTarget = currentWeight > targetWeight;
	const weightMatched = currentWeight === targetWeight;

	const repsAchieved = weightAboveTarget ? true : weightMatched ? currentReps >= targetReps : false;

	const weightNotReached = currentWeight < targetWeight;

	const repsProgressPercent = weightAboveTarget
		? 100
		: weightMatched
			? currentReps + '/' + targetReps
			: weightNotReached
				? 0
				: 0;
	const goalAchieved = weightAboveTarget ? true : weightMatched ? currentReps >= targetReps : false;
	console.log('repsAchieved ' + repsAchieved);

	const achievedDate = goal.progress?.achievedAt ? new Date(goal.progress.achievedAt) : goal.updatedAt ? new Date(goal.updatedAt) : null;

	return (
		<div style={goalsStyles.goalCard}>
			{/* Goal Header */}
			<div style={goalsStyles.goalHeader}>
				<div>
					<h3 style={goalsStyles.goalTitle}>{goal.exerciseName}</h3>
					<p style={goalsStyles.metaLabel}>
						{goal.notes}
					</p>
				</div>
				<span
					style={{
						...goalsStyles.statusBadge,
						backgroundColor: goalAchieved ? mainColor + '15' : colors.blueLight + '15',
						color: goalAchieved ? mainColor : colors.blueLight,
						borderColor: goalAchieved ? mainColor : colors.blueLight,
					}}
				>
					{goalAchieved ? 'Achieved' : 'In Progress'}
				</span>
			</div>

			{/* Goal Metadata */}
			<div style={goalsStyles.goalMeta}>
				<div style={goalsStyles.metaItem}>
					<span style={goalsStyles.metaLabel}>Current</span>
					<strong style={goalsStyles.metaValue}>
						{`${goal.progress?.highestWeight ? `${goal.progress.highestWeight} kg` : '0 kg'} × ${goal.progress?.matchedReps ?? goal.progress?.matchedSets ?? 0} reps${goal.targetReps > 0 ? ` / ${goal.targetReps} target` : ''
							}`}
					</strong>
				</div>
				<div style={goalsStyles.metaItem}>
					<span style={goalsStyles.metaLabel}>Target</span>
					<strong style={goalsStyles.metaValue}>
						{`${goal.targetWeight} kg × ${goal.targetSets} reps`}
					</strong>
				</div>

			</div>

			{/* Progress Bars */}
			<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
				<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
					<span style={goalsStyles.metaLabel}>Weight progress</span>
					<span style={goalsStyles.progressPercent}>{weightProgressPercent}%</span>
				</div>
				<div style={goalsStyles.progressBar}>
					<div
						style={{
							...goalsStyles.progressFill,
							backgroundColor: weightAchieved ? mainColor || colors.green : colors.blueLight,
							width: `${weightProgressPercent}%`,
						}}
					/>
				</div>
				{
					weightMatched &&
					<>
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginTop: '4px' }}>
							<span style={goalsStyles.metaLabel}>{weightAchieved ? 'Reps progress' : 'Reps progress (wait for target weight)'}</span>
							<span style={goalsStyles.progressPercent}>{repsProgressPercent}</span>
						</div>
						<div style={goalsStyles.progressBar}>
							<div
								style={{
									...goalsStyles.progressFill,
									backgroundColor: currentReps >= targetReps ? mainColor || colors.green : colors.blueLight,
									width: `${repsProgressPercent}%`,
								}}
							/>
						</div>
					</>
				}
				{/* Achieved Date */}
				{goal.progress.achievedAt && (
					<p style={{ opacity: 0.75, margin: 0 }}>
						Achieved on {new Date(goal.progress.achievedAt).toLocaleDateString()}
					</p>
				)}
			</div>



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
