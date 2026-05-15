import React, { useContext } from 'react';
import { GlobalContext } from '../../../../context/GlobalContext';
import { createExercisesStyles } from '../ExersicesStyles';

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
	weights = [],
	previousDate = '',
}) {
	const { mainColor } = useContext(GlobalContext);
	const styles = createExercisesStyles(mainColor);

	if (!Array.isArray(weights) || weights.length === 0) {
		return null;
	}

	return (
		<div style={styles.settingsRow}>
			{/* {previousDate && (
				<div style={styles.prevMetaText}>Previous: {previousDate}</div>
			)} */}
			{weights.map((weight) => {
				const normalizedSets = normalizeSets(weight.sets || []);

				return (
					<div key={weight._id || `${weight.weight}`} style={styles.weightBlock}>
						<div style={styles.weightButton}>
							<span style={styles.PrevWeightText}>{weight.weight}kg</span>
						</div>

						<div
							style={{
								display: 'flex',
								width: '100%',
								alignItems: 'center',
								justifyContent: normalizedSets.length > 0 ? 'space-between' : 'flex-end',
							}}
						>
							<div style={styles.repsContainer}>
								{normalizedSets.length > 0 && <div>-</div>}
								<div style={styles.repsContainerRow}>
									{normalizedSets.map((set) => (
										<div
											key={set._id}
											style={{
												background: 'none',
												border: 'none',
												padding: '2px',
												margin: '0 2px',
											}}
										>
											<span style={styles.PrevSetText}>{set.reps}x</span>
										</div>
									))}
								</div>
							</div>
						</div>
					</div>
				);
			})}
		</div>
	);
}
