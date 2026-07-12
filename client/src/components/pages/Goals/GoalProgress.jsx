import React, { useContext, useMemo } from 'react';
import { createGoalsStyles } from './GoalsStyles';
import { GlobalContext } from '../../../context/GlobalContext';
import { colors } from '../../../styles/commonStyle';
import ProgressEllipseVisual from '../Progress/ProgressEllipseVisual';

export default function GoalProgress({ goals = [] }) {
	const { mainColor } = useContext(GlobalContext);
	const goalsStyles = useMemo(() => createGoalsStyles(mainColor), [mainColor]);

	const completedGoals = useMemo(
		() => goals.filter((goal) => goal.progress?.isAchieved).length,
		[goals]
	);
	const inProgressGoals = useMemo(
		() => goals.length - completedGoals,
		[goals, completedGoals]
	);
	const totalGoals = goals.length;
	const completionPercent = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

	return (
		<div style={goalsStyles.goalProgress}>
			<h3 style={goalsStyles.goalProgressTitle}>Goal Progress</h3>
			<div style={goalsStyles.goalProgressCard}>
				<ProgressEllipseVisual
					progressPercent={completionPercent}
					progressStyles={goalsStyles}
					size={150}
					stroke={10}
					valueFontSize={20}
					labelFontSize={14}
					label="Completed"
				/>
				<div style={goalsStyles.goalProgressContext}>
					<div style={goalsStyles.goalProgressrow}>
						<span style={{ ...goalsStyles.goalProgressDott, backgroundColor: mainColor }}></span>
						<h4 style={goalsStyles.goalProgressName}>Completed</h4>
						<div style={goalsStyles.goalProgressValue}><span style={{ color: mainColor }}>{completedGoals}</span></div>
					</div>
					<div style={goalsStyles.goalProgressrow}>
						<span style={{ ...goalsStyles.goalProgressDott, backgroundColor: colors.blueLight }}></span>
						<h4 style={goalsStyles.goalProgressName}>In Progress</h4>
						<div style={goalsStyles.goalProgressValue}><span style={{ color: colors.blueLight }}>{inProgressGoals}</span></div>
					</div>
					<div style={goalsStyles.goalProgressrow}>
						<span style={{ ...goalsStyles.goalProgressDott, backgroundColor: colors.inputBorder }}></span>
						<h4 style={goalsStyles.goalProgressName}>Not started</h4>
						<div style={goalsStyles.goalProgressValue}><span style={{ color: colors.inputBorder }}>0</span></div>
					</div>
				</div>
			</div>
		</div>
	);
}
