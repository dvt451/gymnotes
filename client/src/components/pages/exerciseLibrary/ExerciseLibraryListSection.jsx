import React, { useMemo, useState } from 'react';
import ExerciseLibraryItem from './ExerciseLibraryItem';
import SectionSkeleton from '../../widgets/Loading/SectionSkeleton';
import { createPopupStyle } from '../../widgets/popupStyle';

export default function ExerciseLibraryListSection({
	commonStyle,
	deletingExerciseId,
	error,
	isLoading,
	onDeleteExercise,
	onRenameExercise,
	renamingExerciseId,
	styles,
	userExercises,
}) {
	const [searchValue, setSearchValue] = useState('');
	const popupStyle = createPopupStyle();

	// Фильтрация и группировка упражнений на основе поискового запроса
	const filteredAndGroupedExercises = useMemo(() => {
		if (!userExercises || userExercises.length === 0) {
			return [];
		}

		const normalizedQuery = searchValue.trim().toLowerCase();

		// Сначала фильтруем упражнения
		let filteredExercises = userExercises;

		if (normalizedQuery) {
			filteredExercises = userExercises.filter((exercise) => {
				const name = String(exercise?.name || '').toLowerCase();
				const muscleGroup = String(exercise?.muscleGroup || '').toLowerCase();
				return name.includes(normalizedQuery) || muscleGroup.includes(normalizedQuery);
			});
		}

		// Затем группируем отфильтрованные упражнения
		const groups = {};
		filteredExercises.forEach((exercise) => {
			const groupName = exercise?.muscleGroup || 'Other';
			if (!groups[groupName]) {
				groups[groupName] = [];
			}
			groups[groupName].push(exercise);
		});

		// Преобразуем объект в массив для удобства рендеринга
		return Object.entries(groups).map(([group, exercises]) => ({
			group,
			exercises,
		})).sort((a, b) => a.group.localeCompare(b.group)); // Сортируем группы по алфавиту
	}, [userExercises, searchValue]);

	// Подсчёт общего количества отфильтрованных упражнений
	const totalFilteredCount = useMemo(() => {
		return filteredAndGroupedExercises.reduce((sum, group) => sum + group.exercises.length, 0);
	}, [filteredAndGroupedExercises]);

	// Если идёт загрузка
	if (isLoading && !error) {
		return (
			<>
				<div style={{ ...commonStyle.commonSection, ...styles.exercisesListTitle }}>
					<h3 style={commonStyle.title}>User Library</h3>
				</div>
				<div style={styles.exercisesList}>
					{[3, 2].map((cardCount, index) => (
						<section
							key={`exercise-library-skeleton-${index}`}
							style={{ ...styles.exerciseGroupSection, ...commonStyle.commonSection }}
						>
							<div style={styles.exerciseGroupHeader}>
								<div
									className="ui-skeleton"
									style={{ width: index === 0 ? '36%' : '28%', height: '24px' }}
								></div>
								<div
									className="ui-skeleton"
									style={{ width: '92px', height: '16px' }}
								></div>
							</div>
							<SectionSkeleton
								showHeader={false}
								cards={cardCount}
								cardHeight={64}
								cardGap={10}
							/>
						</section>
					))}
				</div>
			</>
		);
	}

	return (
		<>
			<div style={{ ...commonStyle.commonSection, ...styles.exercisesListTitle }}>
				<h3 style={commonStyle.title}>User Library</h3>
				{/* Поиск */}
				<div style={{
					...styles.searchContainer, ...{
						marginTop: '20px',
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

			{error && <p style={styles.error}>{error}</p>}

			<div style={styles.exercisesList}>


				{/* Состояние: нет упражнений */}
				{!isLoading && !error && userExercises.length === 0 && (
					<p style={styles.noExercises}>You have no exercises yet</p>
				)}

				{/* Состояние: поиск не дал результатов */}
				{!isLoading && !error && userExercises.length > 0 && filteredAndGroupedExercises.length === 0 && (
					<p style={styles.noExercises}>No exercises found for "{searchValue}"</p>
				)}

				{/* Список групп и упражнений */}
				{filteredAndGroupedExercises.map(({ group, exercises }) => (
					<section
						key={group}
						style={{ ...styles.exerciseGroupSection, ...commonStyle.commonSection }}
					>
						<div style={styles.exerciseGroupHeader}>
							<h4 style={styles.exerciseGroupTitle}>{group}</h4>
							<span style={styles.exerciseGroupCount}>
								{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
							</span>
						</div>
						{exercises.map((item) => (
							<ExerciseLibraryItem
								key={item._id || item.id || item.name}
								name={item.name}
								muscleGroup={item.muscleGroup}
								onRename={() => onRenameExercise(item)}
								onDelete={() => onDeleteExercise(item)}
								isRenaming={renamingExerciseId === String(item._id || item.id)}
								isDeleting={deletingExerciseId === String(item._id || item.id)}
							/>
						))}
					</section>
				))}
			</div>
		</>
	);
}