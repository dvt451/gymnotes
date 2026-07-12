import React, { useContext, useMemo, useState } from 'react';
import { GlobalContext } from '../../../context/GlobalContext';
import { createPopupStyle } from '../../widgets/popupStyle';
import { createGoalsStyles } from './GoalsStyles';
import { createTemplatesStyles } from '../Exercises/Templates/TemplatesStyles.js';
import { colors } from '../../../styles/commonStyle.js';
import Select from '../../widgets/Select.jsx';

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
	const goalType = formState.goalType || 'exercise';

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
				<div style={goalsStyles.formRow}>
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<label style={goalsStyles.metaLabel}>Goal type</label>
						{/* <Select
							options={['exercise', 'body', 'skill']}
							value={goalType}
							onChange={onInputChange}
						/> */}
						<select
							name="goalType"
							value={goalType}
							onChange={onInputChange}
							style={popupStyle.popupInput}
						>
							<option value="exercise">Exercise</option>
							<option value="body">Body</option>
							<option value="skill">Tricks & Skills</option>
						</select>
					</div>
				</div>

				{goalType === 'exercise' && (
					<>
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
								<div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
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
								<label style={goalsStyles.metaLabel}>Reps</label>
								<input
									name="targetReps"
									type="number"
									value={formState.targetReps}
									onChange={onInputChange}
									min="1"
									step="1"
									style={popupStyle.popupInput}
								/>
							</div>
						</div>
					</>
				)}

				{goalType === 'body' && (
					<>
						<div style={goalsStyles.formRow}>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
								<label style={goalsStyles.metaLabel}>Body part</label>
								<input
									name="bodyPart"
									type="text"
									value={formState.bodyPart}
									onChange={onInputChange}
									placeholder="Chest, waist, etc."
									style={popupStyle.popupInput}
								/>
							</div>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
								<label style={goalsStyles.metaLabel}>Measurement</label>
								<Select
    value={goalType}
    style={popupStyle.popupInput}
    options={[
        { value: 'exercise', label: 'Exercise' },
        { value: 'body', label: 'Body' },
        { value: 'skill', label: 'Tricks & Skills' },
    ]}
    onChange={(value) =>
        onInputChange({
            target: {
                name: 'goalType',
                value,
            },
        })
    }
/>
							</div>
						</div>
						<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
							<label style={goalsStyles.metaLabel}>Target value</label>
							<input
								name="targetValue"
								type="text"
								inputMode="decimal"
								value={formState.targetValue}
								onChange={onInputChange}
								onKeyDown={(event) => {
									if (event.key === 'Enter') {
										event.preventDefault();
										event.currentTarget.form?.requestSubmit?.();
									}
								}}
								placeholder="e.g. 15.10"
								style={popupStyle.popupInput}
							/>
						</div>
					</>
				)}

				{goalType === 'skill' && (
					<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
						<label style={goalsStyles.metaLabel}>Trick or skill</label>
						<input
							name="skillName"
							type="text"
							value={formState.skillName}
							onChange={onInputChange}
							placeholder="Handstand, split, etc."
							style={popupStyle.popupInput}
						/>
					</div>
				)}

				<div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
					<label style={goalsStyles.metaLabel}>Notes</label>
					<textarea
						name="notes"
						value={formState.notes}
						onChange={onInputChange}
						style={{ ...popupStyle.popupInput, minHeight: '80px', resize: 'vertical' }}
					/>
				</div>

				{error && <p style={{ color: 'tomato' }}>{error}</p>}

				<button
					type="submit"
					style={{ ...goalsStyles.newGoalAddButton, backgroundColor: mainColor || colors.green, width: '100%', padding: '12px 0' }}
					disabled={isSubmitting}
				>
					{isSubmitting ? 'Saving...' : 'Create goal'}
				</button>
			</form>
		</div>
	);
}
