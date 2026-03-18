import React, { useContext } from 'react';
import {
	formatPercent,
	getProgressTone,
	getProgressVisualValue,
} from './progressUtils';
import { createCommonStyle } from '../../../styles/commonStyle';
import { GlobalContext } from '../../../context/GlobalContext';

export default function MuscleGroupProgressBarsSection({
	muscleGroups = [],
	progressStyles,
}) {
	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);
	return (
		<div style={{ ...progressStyles.section, width: '100%' }}>
			<div style={progressStyles.progressBarSectionList}>
				{muscleGroups.map((group) => (
					<div
						key={`${group.muscleGroup}-progress`}
						style={progressStyles.progressBarSectionCard}
					>
						<div style={progressStyles.progressBarSectionHeader}>
							<h3 style={progressStyles.muscleGroupName}>{group.muscleGroup}</h3>
						</div>
						<div style={progressStyles.progressBarTrack}>
							<div
								style={{
									...progressStyles.progressBarFill,
									width: `${getProgressVisualValue(group.progressPercent)}%`,
								}}
							/>
						</div>
						<strong
							style={{
								...progressStyles.progressBarSectionValue,
							}}
						>
							{formatPercent(group.progressPercent)}
						</strong>
					</div>
				))}
			</div>
		</div>
	);
}
