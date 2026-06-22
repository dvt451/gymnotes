import React, { useContext, useMemo } from 'react';
import GoalCard from './GoalCard';
import { GlobalContext } from '../../../context/GlobalContext';
import { createGoalsStyles } from './GoalsStyles';

export default function GoalsList({ goals, isLoading, onDelete }) {
	const { mainColor } = useContext(GlobalContext);
	const goalsStyles = useMemo(() => createGoalsStyles(mainColor), [mainColor]);

	const goalCount = goals.length;

	if (isLoading) {
		return (
			<div style={goalsStyles.statusCard}>
				<p style={goalsStyles.statusText}>Loading goals...</p>
			</div>
		);
	}

	if (goalCount === 0) {
		return (
			<div style={goalsStyles.statusCard}>
				<p style={goalsStyles.statusText}>
					No goals yet. Add your first target to start tracking achievements.
				</p>
			</div>
		);
	}

	return (
		<div style={goalsStyles.goalGrid}>
			{goals.map((goal) => (
				<GoalCard key={goal._id} goal={goal} onDelete={onDelete} />
			))}
		</div>
	);
}
