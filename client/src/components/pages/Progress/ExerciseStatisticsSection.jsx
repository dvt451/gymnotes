import React from 'react';
import {
	formatWeight,
} from './progressUtils';
import ProgressEllipseVisual from './ProgressEllipseVisual';
import { colors } from '../../../styles/commonStyle';

export default function ExerciseStatisticsSection({
	commonStyle,
	exercises = [],
	progressStyles,
}) {
	return (
		<div style={progressStyles.section}>
			<div style={commonStyle.titleHeader}>
				<h2 style={commonStyle.title}>Exercise statistics</h2>
			</div>
			<div style={progressStyles.exerciseStatsList}>
				{exercises.map((exercise) => (
					<div
						key={exercise.exerciseId || exercise.name}
						style={progressStyles.exerciseStatCard}
					>
						<div style={progressStyles.exerciseStatLayout}>
							<div style={progressStyles.exerciseStatHeader}>
								<div style={progressStyles.exerciseStatNameBlock}>
									<h3 style={progressStyles.muscleGroupName}>{exercise.name}</h3>
									<p style={progressStyles.subtitle}>{exercise.muscleGroup}</p>
								</div>
							</div>
							<p style={progressStyles.exerciseRange}>
								<span style={{ color: colors.blueLight }}>{formatWeight(exercise.startingWeight)}</span> - <span style={{ color: colors.green }}>{formatWeight(exercise.currentWeight)}</span>
							</p>
							<div style={progressStyles.exerciseVisualBlock}>
								<ProgressEllipseVisual
									progressPercent={exercise.progressPercent}
									progressStyles={progressStyles}
									label={null}
									size={80}
									stroke={8}
									valueFontSize={12}
									labelFontSize={6}
								/>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
