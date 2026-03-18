import React from 'react';
import {
	formatWeight,
} from './progressUtils';
import ProgressEllipseVisual from './ProgressEllipseVisual';

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
							<div style={progressStyles.exerciseStatContent}>
								<div style={progressStyles.exerciseStatHeader}>
									<div style={progressStyles.exerciseStatNameBlock}>
										<h3 style={progressStyles.muscleGroupName}>{exercise.name}</h3>
										<p style={progressStyles.subtitle}>{exercise.muscleGroup}</p>
									</div>
								</div>
								<p style={progressStyles.exerciseRange}>
									{formatWeight(exercise.startingWeight)} - {formatWeight(exercise.currentWeight)}
								</p>
							</div>
							<div style={progressStyles.exerciseVisualBlock}>
								<ProgressEllipseVisual
									progressPercent={exercise.progressPercent}
									progressStyles={progressStyles}
									label="Exercise"
									size={116}
									stroke={12}
									valueFontSize={20}
									labelFontSize={12}
								/>
							</div>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
