import React from 'react';
import ProgressStatItem from './ProgressStatItem';
import {
	formatPercent,
	formatWeight,
	getValueStyle,
} from './progressUtils';

export default function MuscleGroupStatisticsSection({
	commonStyle,
	muscleGroups = [],
	progressStyles,
}) {

	return (
		<div style={progressStyles.section}>
			<div style={{ ...commonStyle.titleHeader, ...progressStyles.exerciseGroupCard, ...progressStyles.titleHeader }}>
				<h2 style={commonStyle.title}>Muscle group statistics</h2>
			</div>
			<div style={progressStyles.muscleGroupGrid}>
				{muscleGroups.map((group) => (
					<div key={group.muscleGroup} style={progressStyles.muscleGroupCard}>
						<div>
							<h3 style={progressStyles.muscleGroupName}>{group.muscleGroup}</h3>
							<p style={progressStyles.subtitle}>
								{group.exercisesTracked} exercise{group.exercisesTracked === 1 ? '' : 's'} tracked
							</p>
						</div>
						<div style={progressStyles.statsGrid}>
							{/* <ProgressStatItem label="Start" value={formatWeight(group.startingWeight)} styles={progressStyles} /> */}
							{/* <ProgressStatItem label="Current" value={formatWeight(group.currentWeight)} styles={progressStyles} /> */}
							{/* <ProgressStatItem
								label="Added"
								value={`${group.addedWeight > 0 ? '+' : ''}${formatWeight(group.addedWeight)}`}
								valueStyle={getValueStyle(progressStyles, group.addedWeight)}
								styles={progressStyles}
							/> */}
							<ProgressStatItem
								label="Progress"
								value={formatPercent(group.progressPercent)}
								valueStyle={getValueStyle(progressStyles, group.progressPercent)}
								styles={progressStyles}
							/>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
