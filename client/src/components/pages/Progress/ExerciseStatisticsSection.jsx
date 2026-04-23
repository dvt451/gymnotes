import React, { useContext, useMemo, useState } from 'react';
import {
	formatWeight,
} from './progressUtils';
import ProgressEllipseVisual from './ProgressEllipseVisual';
import { colors } from '../../../styles/commonStyle';
import { createPopupStyle } from '../../widgets/popupStyle';
import { GlobalContext } from '../../../context/GlobalContext';

export default function ExerciseStatisticsSection({
	commonStyle,
	exercises = [],
	progressStyles,
}) {
	const { mainColor } = useContext(GlobalContext);
	const [searchValue, setSearchValue] = useState('');
	const popupStyle = createPopupStyle(mainColor);
	const groupedExercises = useMemo(() => {
		const normalizedQuery = searchValue.trim().toLowerCase();
		const filteredExercises = normalizedQuery
			? exercises.filter((exercise) => {
				const name = String(exercise?.name || '').toLowerCase();
				const muscleGroup = String(exercise?.muscleGroup || '').toLowerCase();
				return name.includes(normalizedQuery) || muscleGroup.includes(normalizedQuery);
			})
			: exercises;

		return filteredExercises.reduce((groups, exercise) => {
			const groupName = exercise?.muscleGroup || 'Other';
			if (!groups[groupName]) {
				groups[groupName] = [];
			}
			groups[groupName].push(exercise);
			return groups;
		}, {});
	}, [exercises, searchValue]);

	const groupedEntries = Object.entries(groupedExercises).sort(([leftName], [rightName]) =>
		leftName.localeCompare(rightName)
	);

	return (
		<div style={progressStyles.section}>
			<div style={{ ...commonStyle.titleHeader, ...progressStyles.exerciseGroupCard, ...progressStyles.titleHeader }}>
				<h2 style={commonStyle.title}>Exercise statistics</h2>
				<div style={{
					...progressStyles.exerciseSearchWrap, ...{
						width: '100%',
					}
				}}>
					<input
						type="text"
						value={searchValue}
						onChange={(event) => setSearchValue(event.target.value)}
						placeholder="Search exercise or muscle group"
						style={popupStyle.popupInput}
					/>
				</div>
			</div>

			<div style={progressStyles.exerciseGroupList}>
				{groupedEntries.map(([muscleGroup, groupExercises]) => (
					<div key={muscleGroup} style={progressStyles.exerciseGroupCard}>
						<div style={progressStyles.exerciseGroupHeader}>
							<h3 style={progressStyles.muscleGroupName}>{muscleGroup}</h3>
							<p style={progressStyles.subtitle}>
								{groupExercises.length} exercise{groupExercises.length === 1 ? '' : 's'}
							</p>
						</div>
						<div style={progressStyles.exerciseStatsList}>
							{groupExercises.map((exercise) => (
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
				))}
			</div>
			{groupedEntries.length === 0 && (
				<div style={progressStyles.statusCard}>
					<p style={progressStyles.statusText}>
						No exercises found for "{searchValue.trim()}".
					</p>
				</div>
			)}
		</div>
	);
}
