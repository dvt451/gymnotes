import React, { useContext, useMemo, useState } from 'react';
import { GlobalContext } from '../../../context/GlobalContext';
import { createGoalsStyles } from './GoalsStyles';
import { colors, toRem } from '../../../styles/commonStyle';
import { FaTrash } from 'react-icons/fa';

export default function GoalCard({ goal, onDelete, onUpdateGoal, editState }) {
	const { mainColor } = useContext(GlobalContext);
	const goalsStyles = useMemo(() => createGoalsStyles(mainColor), [mainColor]);
	const [draftBodyValue, setDraftBodyValue] = useState(goal.currentValue ?? goal.progress?.currentValue ?? '');
	const [isSavingBody, setIsSavingBody] = useState(false);
	const [isSavingSkill, setIsSavingSkill] = useState(false);

	const goalType = goal.goalType || 'exercise';
	const isBodyGoal = goalType === 'body';
	const isSkillGoal = goalType === 'skill';

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
			? `${currentReps}/${targetReps}`
			: weightNotReached
				? 0
				: 0;
	const goalAchieved = isBodyGoal
		? Number(goal.currentValue ?? goal.progress?.currentValue ?? 0) >= Number(goal.targetValue ?? 0)
		: isSkillGoal
			? Boolean(goal.isCompleted ?? goal.progress?.isAchieved)
			: weightAboveTarget ? true : weightMatched ? currentReps >= targetReps : false;

	const bodyTargetValue = Number(goal.targetValue ?? 0);
	const bodyCurrentValue = Number(goal.currentValue ?? goal.progress?.currentValue ?? 0);
	const bodyProgressPercent = bodyTargetValue > 0 ? Math.min(100, Math.round((bodyCurrentValue / bodyTargetValue) * 100)) : 0;
	const bodyAchieved = bodyTargetValue > 0 ? bodyCurrentValue >= bodyTargetValue : false;
	const skillAchieved = Boolean(goal.isCompleted ?? goal.progress?.isAchieved);

	const handleSaveBodyValue = async () => {
		const normalizedInput = String(draftBodyValue).trim().replace(',', '.');
		const newValue = Number(normalizedInput);

		if (!normalizedInput || !Number.isFinite(newValue) || newValue <= 0) {
			return;
		}

		setIsSavingBody(true);
		try {
			await onUpdateGoal(goal._id, { currentValue: newValue });
		} finally {
			setIsSavingBody(false);
		}
	};

	const handleBodyValueKeyDown = (event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			handleSaveBodyValue();
		}
	};

	const handleToggleSkill = async () => {
		setIsSavingSkill(true);
		try {
			await onUpdateGoal(goal._id, { isCompleted: !skillAchieved });
		} finally {
			setIsSavingSkill(false);
		}
	};

	return (
		<div style={goalsStyles.goalCard}>
			<div style={goalsStyles.goalHeader}>
				<div>
					<h3 style={goalsStyles.goalTitle}>{goal.bodyPart || goal.exerciseName}</h3>
					<p style={goalsStyles.metaLabel}>{goal.notes}</p>
				</div>
				<div style={{
					display: 'flex',
					gap: toRem(8),
					alignItems: 'center',
					flexWrap: 'nowrap',
				}}>
					<span
						style={{
							...goalsStyles.statusBadge,
							backgroundColor: goalAchieved ? mainColor + '15' : colors.blueLight + '15',
							color: goalAchieved ? mainColor : colors.blueLight,
							borderColor: goalAchieved ? mainColor : colors.blueLight,
						}}
					>
						{goalAchieved ? 'Achieved' : isSkillGoal ? 'Not done' : 'In Progress'}

					</span>
					{editState && <button
						type="button"
						style={goalsStyles.deleteButton}
						onClick={() => onDelete(goal._id)}
					>
						<FaTrash />
					</button>}
				</div>
			</div>

			{isBodyGoal ? (
				<>
					<div style={goalsStyles.goalMeta}>
						<div style={goalsStyles.metaItem}>
							<span style={goalsStyles.metaLabel}>Current</span>
							{editState ? <div style={{ display: 'flex', gap: '8px', padding: '10px 0', alignItems: 'center' }}>
								<input
									type="text"
									inputMode="decimal"
									value={draftBodyValue}
									onChange={(event) => setDraftBodyValue(event.target.value)}
									onKeyDown={handleBodyValueKeyDown}
									onBlur={handleSaveBodyValue}
									style={{ ...goalsStyles.input, flex: '0 0' + toRem(70) }}
								/>
							</div> :
								<strong style={goalsStyles.metaValue}>{bodyCurrentValue} {goal.measurementUnit || 'kg'}</strong>
							}
						</div>
						<div style={goalsStyles.metaItem}>
							<span style={goalsStyles.metaLabel}>Target</span>
							<strong style={goalsStyles.metaValue}>{bodyTargetValue} {goal.measurementUnit || 'kg'}</strong>
						</div>
					</div>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
							<span style={goalsStyles.metaLabel}>Progress</span>
							<span style={goalsStyles.progressPercent}>{bodyProgressPercent}%</span>
						</div>
						<div style={goalsStyles.progressBar}>
							<div style={{ ...goalsStyles.progressFill, backgroundColor: bodyAchieved ? mainColor || colors.green : colors.blueLight, width: `${bodyProgressPercent}%` }} />
						</div>
					</div>
				</>
			) : isSkillGoal ? (
				<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
					<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
						<span style={goalsStyles.metaLabel}>Status</span>
						<span style={goalsStyles.progressPercent}>{skillAchieved ? 'Done' : 'Undone'}</span>
					</div>
					<div style={goalsStyles.progressBar}>
						<div style={{ ...goalsStyles.progressFill, backgroundColor: skillAchieved ? mainColor || colors.green : colors.blueLight, width: `${skillAchieved ? 100 : 0}%` }} />
					</div>
				</div>
			) : (
				<>
					<div style={goalsStyles.goalMeta}>
						<div style={goalsStyles.metaItem}>
							<span style={goalsStyles.metaLabel}>Current</span>
							<strong style={goalsStyles.metaValue}>
								{`${goal.progress?.highestWeight ? `${goal.progress.highestWeight} kg` : '0 kg'} × ${goal.progress?.matchedReps ?? goal.progress?.matchedSets ?? 0} reps`}
							</strong>
						</div>
						<div style={goalsStyles.metaItem}>
							<span style={goalsStyles.metaLabel}>Target</span>
							<strong style={goalsStyles.metaValue}>
								{`${goal.targetWeight} kg × ${goal.targetReps} reps`}
							</strong>
						</div>

					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
						<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
							<span style={goalsStyles.metaLabel}>Weight progress</span>
							<span style={goalsStyles.progressPercent}>{weightProgressPercent}%</span>
						</div>
						<div style={goalsStyles.progressBar}>
							<div style={{ ...goalsStyles.progressFill, backgroundColor: weightAchieved ? mainColor || colors.green : colors.blueLight, width: `${weightProgressPercent}%` }} />
						</div>
						{weightMatched && (
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
						)}
					</div>
				</>
			)}

			{goal.progress?.achievedAt && (
				<p style={{ opacity: 0.75, margin: 0 }}>
					Achieved on {new Date(goal.progress.achievedAt).toLocaleDateString()}
				</p>
			)}

			{editState && <div style={goalsStyles.actionRow}>

				{isSkillGoal && (
					<button type="button" style={{
						...goalsStyles.newGoalAddButton,
						padding: '10px 20px',
						border: toRem(1) + ' solid ' + skillAchieved ? colors.blueLight : (mainColor || colors.green),
						backgroundColor: skillAchieved ? colors.blueLight : mainColor || colors.green
					}} onClick={handleToggleSkill} disabled={isSavingSkill}>
						{skillAchieved ? 'Mark not done' : 'Mark done'}
					</button>
				)}
			</div>}
		</div>
	);
}
