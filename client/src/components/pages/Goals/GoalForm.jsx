import React, { useContext, useMemo, useState } from 'react';
import Select from '../../widgets/Select.jsx';
import { GlobalContext } from '../../../context/GlobalContext';
import { createPopupStyle } from '../../widgets/popupStyle';
import { createGoalsStyles } from './GoalsStyles';
import { createTemplatesStyles } from '../Exercises/Templates/TemplatesStyles.js';
import { colors } from '../../../styles/commonStyle.js';

export default function GoalForm({
	formState,
	libraryExercises,
	libraryLoading,
	libraryError,
	error,
	isSubmitting,
	onInputChange,
	onSelectChange,
	onSubmit,
}) {
	const { mainColor } = useContext(GlobalContext);
	const [exerciseSearch, setExerciseSearch] = useState('');
	const goalsStyles = useMemo(() => createGoalsStyles(mainColor), [mainColor]);
	const popupStyle = createPopupStyle();
	const templatesStyles = createTemplatesStyles(mainColor);
	const [isSearchFocused, setIsSearchFocused] = useState(false);

	const filteredExercises = useMemo(() => {
		if (!exerciseSearch.trim()) {
			return libraryExercises;
		}
		const query = exerciseSearch.toLowerCase().trim();
		return libraryExercises.filter((exercise) =>
			exercise.name.toLowerCase().includes(query)
		);
	}, [libraryExercises, exerciseSearch]);

	return (
		<div style={goalsStyles.card} id="goal-form">
			<h3 style={goalsStyles.goalTitle}>New goal</h3>

			<form onSubmit={onSubmit} style={{ display: 'grid', gap: '14px' }}>
				{/* Exercise Selection */}
				<div >
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<label style={goalsStyles.metaLabel}>Exercise</label>
						<input
							type="text"
							placeholder="Search exercises..."
							value={exerciseSearch}
							onFocus={() => setIsSearchFocused(true)}
							onChange={(e) => setExerciseSearch(e.target.value)}
							style={popupStyle.popupInput}
						/>

						{isSearchFocused && exerciseSearch.trim() && (
							<div
								style={{
									display: 'flex',
									gap: '4px',
								}}
							>
								{filteredExercises.map((exercise) => (
									<button
										key={exercise._id}
										type="button"
										onClick={() => {
											onSelectChange(exercise._id);
											setExerciseSearch(exercise.name);
											setIsSearchFocused(false);
										}}
										style={{
											...templatesStyles.templateItem,
											cursor: 'pointer',
											textAlign: 'left',
											background:
												formState.exerciseUserLibraryId === exercise._id
													? '#22c55e'
													: colors.blueLight,
											color:
												formState.exerciseUserLibraryId === exercise._id
													? '#fff'
													: undefined,
											border:
												formState.exerciseUserLibraryId === exercise._id
													? '1px solid #22c55e'
													: undefined,
										}}
									>
										{exercise.name}
									</button>
								))}
							</div>
						)}
						{libraryError && <p style={{ color: 'tomato', margin: 0 }}>{libraryError}</p>}
						{!libraryLoading && libraryExercises.length === 0 && (
							<p style={{ color: 'rgba(255,255,255,0.75)', margin: 0 }}>
								Add exercises in the library before creating a goal.
							</p>
						)}
					</div>
				</div>

				{/* Target Weight and Approach */}
				<div style={goalsStyles.formRow}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<label style={goalsStyles.metaLabel}>Target weight</label>
						<input
							name="targetWeight"
							type="number"
							value={formState.targetWeight}
							onChange={onInputChange}
							min="0"
							step="0.5"
							placeholder="kg"
							style={popupStyle.popupInput}
						/>
					</div>

					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<label style={goalsStyles.metaLabel}>Approach</label>
						<input
							name="targetSets"
							type="number"
							value={formState.targetSets}
							onChange={onInputChange}
							min="1"
							step="1"
							style={popupStyle.popupInput}
						/>
					</div>
				</div>

				{/* Error Message */}
				{error && <p style={{ color: 'tomato' }}>{error}</p>}

				{/* Submit Button */}
				<button
					type="submit"
					style={{ ...goalsStyles.addButton, width: 'fit-content' }}
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Saving...' : 'Create goal'}
				</button>
			</form>
		</div>
	);
}
