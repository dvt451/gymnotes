import React, { useContext, useEffect, useState } from 'react';
import ProgressStatItem from './ProgressStatItem';
import {
	formatDate,
	formatPercent,
	formatWeight,
	getValueStyle,
} from './progressUtils';
import { createCommonStyle, toRem } from '../../../styles/commonStyle';
import MuscleGroupProgressBarsSection from './MuscleGroupProgressBarsSection';
import { GlobalContext } from '../../../context/GlobalContext';
import ProgressEllipseVisual from './ProgressEllipseVisual';

export default function OverallProgressSection({
	overall,
	period,
	progressStyles,
	muscleGroups
}) {
	const [isTabletLayout, setIsTabletLayout] = useState(false);
	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);
	useEffect(() => {
		if (typeof window === 'undefined') return undefined;

		const mediaQuery = window.matchMedia('(max-width: 1024px)');
		const applyLayout = (event) => {
			setIsTabletLayout(event.matches);
		};

		setIsTabletLayout(mediaQuery.matches);

		if (typeof mediaQuery.addEventListener === 'function') {
			mediaQuery.addEventListener('change', applyLayout);
			return () => mediaQuery.removeEventListener('change', applyLayout);
		}

		mediaQuery.addListener(applyLayout);
		return () => mediaQuery.removeListener(applyLayout);
	}, []);

	const visualBlock = (
		<div style={progressStyles.overallVisualBlock}>
			<ProgressEllipseVisual
				progressPercent={overall?.progressPercent}
				progressStyles={progressStyles}
				label="Overall"
				size={220}
				stroke={24}
				valueFontSize={32}
				labelFontSize={24}
			/>
		</div>
	);

	const contentBlock = (
		<div style={progressStyles.overallCardContent}>
			{/* <div style={progressStyles.statsGrid}>
				<ProgressStatItem
					label="Starting weight"
					value={formatWeight(overall.startingWeight)}
					styles={progressStyles}
				/>
				<ProgressStatItem
					label="Current weight"
					value={formatWeight(overall.currentWeight)}
					styles={progressStyles}
				/>
				<ProgressStatItem
					label="Added weight"
					value={`${overall.addedWeight > 0 ? '+' : ''}${formatWeight(overall.addedWeight)}`}
					valueStyle={getValueStyle(progressStyles, overall.addedWeight)}
					styles={progressStyles}
				/>
				<ProgressStatItem
					label="Progress"
					value={formatPercent(overall.progressPercent)}
					valueStyle={getValueStyle(progressStyles, overall.progressPercent)}
					styles={progressStyles}
				/>
			</div> */}
			<div style={progressStyles.statsGrid}>
				<ProgressStatItem label="Training days" value={period.trainingDays} styles={progressStyles} />
				<ProgressStatItem label="Calendar days" value={period.calendarDays} styles={progressStyles} />
				<ProgressStatItem label="Training plans" value={period.trainingFiles} styles={progressStyles} />
				<ProgressStatItem label="Exercises tracked" value={period.trackedExercises} styles={progressStyles} />
			</div>
		</div>
	);

	return (
		<div style={progressStyles.card}>
			<div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: toRem(10) }}>
				<h3 style={{ ...commonStyle.title, fontSize: toRem(36) }}>Overall statistics</h3>
				<p style={{ ...progressStyles.subtitle, fontSize: toRem(20) }}>
					From {formatDate(period.firstDate)} to {formatDate(period.lastDate)}
				</p>
			</div>
			<div
				style={{
					...progressStyles.overallCardLayout,
					...(isTabletLayout ? progressStyles.overallCardLayoutTablet : {}),
				}}
			>

				{isTabletLayout ? (
					<>
						<div style={{ display: 'flex', gap: toRem(15), alignItems: 'center', flexDirection: 'column' }}>
							{visualBlock}
							<MuscleGroupProgressBarsSection
								muscleGroups={muscleGroups}
								progressStyles={progressStyles}
							/>
						</div>
						{contentBlock}
					</>
				) : (
					<>
						<div style={{ display: 'flex', gap: toRem(15), alignItems: 'center', flexDirection: 'column' }}>
							{visualBlock}
							<MuscleGroupProgressBarsSection
								muscleGroups={muscleGroups}
								progressStyles={progressStyles}
							/>
						</div>
						{contentBlock}
					</>
				)}
			</div>
		</div>
	);
}
