import React, { useContext } from 'react';
import { GlobalContext } from '../../../../context/GlobalContext';
import { createExercisesStyles } from '../ExersicesStyles';
import { colors, toRem } from '../../../../styles/commonStyle';
import { PiChartLineUp } from 'react-icons/pi';
import { BiMessageDetail } from "react-icons/bi";

const normalizeSets = (sets = []) =>
	sets.map((setValue, index) => {
		if (setValue && typeof setValue === 'object') {
			return {
				_id: setValue._id || `prev_set_${index}`,
				reps: Number(setValue.reps) || 0,
			};
		}

		return {
			_id: `prev_set_${index}`,
			reps: Number(setValue) || 0,
		};
	});

export default function PrevWeights({
	historyEntries = [],
	weights = [],
	previousDate = '',
	prevComment = '',
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);

	const normalizedEntries = Array.isArray(historyEntries) && historyEntries.length > 0
		? historyEntries
		: (Array.isArray(weights) && weights.length > 0 ? [{ date: previousDate, weights, comment: prevComment }] : []);

	const visibleEntries = normalizedEntries
		.map((entry) => {
			const entryDate = entry?.date || previousDate;
			const entryWeights = Array.isArray(entry?.weights) ? entry.weights : [];
			const normalizedComment = (entry?.comment || prevComment || '').trim();
			const hasContent = entryWeights.length > 0 || normalizedComment;

			if (!hasContent) return null;

			return {
				...entry,
				date: entryDate,
				weights: entryWeights,
				comment: normalizedComment,
			};
		})
		.filter(Boolean);

	if (visibleEntries.length === 0) {
		return null;
	}

	return (
		<div style={{ ...styles.settingsRow, flexDirection: 'column-reverse' }}>
			{visibleEntries.map((entry, entryIndex) => {
				const entryDate = entry?.date || previousDate;
				const entryWeights = Array.isArray(entry?.weights) ? entry.weights : [];
				const normalizedComment = (entry?.comment || '').trim();

				return (
					<div key={`${entryDate}-${entryIndex}`} style={{ display: 'flex', flexDirection: 'column', gap: toRem(8), width: '100%' }}>
						<div style={{ ...styles.PrevWeightBlock, flexDirection: 'column', alignItems: 'flex-start', gap: toRem(6), paddingBottom: toRem(8) }}>
							<div
								style={{
									display: 'flex',
									gap: toRem(6),
								}}>
								<div style={styles.prevWeightHeader}>
									<div style={{ display: 'flex', alignItems: 'center' }}>
										{entryDate}
										<PiChartLineUp style={{ marginLeft: toRem(6), marginRight: toRem(2) }} />
									</div>
								</div>

								{entryWeights.map((weight, weightIndex) => {
									const normalizedSets = normalizeSets(weight.sets || []);

									return (
										<div key={weight._id || `${weight.weight}-${weightIndex}`} style={{ width: '100%' }}>
											<div style={{ display: 'flex', alignItems: 'center', gap: toRem(6), flexWrap: 'wrap' }}>
												<span style={{ ...styles.PrevWeightText, color: colors.blueLight }}>
													{weight.weight}kg
												</span>
												<div style={{ ...styles.repsContainer, gap: toRem(5) }}>
													{normalizedSets.length > 0 && (
														<span style={{ color: colors.blueLight }}>x</span>
													)}
													<div style={{ ...styles.repsContainerRow, paddingLeft: toRem(2), gap: toRem(2) }}>
														{normalizedSets.map((set, index) => (
															<div
																key={set._id}
																style={{
																	background: 'none',
																	paddingRight: toRem(0),
																	border: 'none',
																	color: colors.blueLight,
																}}
															>
																<span style={styles.PrevSetText}>
																	{set.reps}
																	{index !== normalizedSets.length - 1 && <span style={styles.comma}>, </span>}
																</span>
															</div>
														))}
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>

							{normalizedComment && (

								<div style={{
									width: '100%',
									display: 'flex',
									alignItems: 'center',
									gap: toRem(10),
									padding: `${toRem(10)} ${toRem(15)}`,
									color: colors.blueLight,
									backgroundColor: 'rgb(0 200 255 / 1%)',
									borderRadius: toRem(6),
									borderLeft: `3px solid ${colors.blueLight}`,
									marginLeft: toRem(10),

								}}>
									<span style={{
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										borderRadius: '50%',
										width: toRem(40),
										height: toRem(40),
									    flex: toRem(40) + ' 0 0';
										backgroundColor: colors.blueLight + 30,
									}}><BiMessageDetail style={{ fontSize: toRem(20) }} />
									</span>
									<div>
										<p style={{ ...styles.exerciseCommentTitle, color: colors.blueLight }}>Previous note</p>
										<span style={styles.exercisePreviousCommentText}>{normalizedComment}</span>
									</div>
								</div>
							)}
						</div>
					</div>
				);
			})}
		</div>
	);
}
