// DateItem.jsx
import React from 'react';
import { dateItemStyles } from './DateItemStyles';

export default function DateItem({ item, today, onOpen, onDelete }) {
	const isToday = item.date === today;

	return (
		<div
			style={{
				...dateItemStyles.container,
				...(isToday && dateItemStyles.todayHighlight)
			}}
		>
			<button
				style={dateItemStyles.dateButton}
				onClick={() => onOpen(item.date)}
			>
				<span style={{
					...dateItemStyles.dateText,
					...(isToday && dateItemStyles.todayText)
				}}>
					{item.date}
				</span>
				{isToday && (
					<span style={dateItemStyles.todayBadge}>
						Сегодня
					</span>
				)}
			</button>

			{/* Опционально: счетчик упражнений */}
			{item.exercises && item.exercises.length > 0 && (
				<span style={dateItemStyles.exercisesCount}>
					{item.exercises.length} ex.
				</span>
			)}

			<button
				style={dateItemStyles.deleteButton}
				onClick={(e) => {
					e.stopPropagation();
					onDelete(item.id);
				}}
			>
				<span style={dateItemStyles.deleteText}>✖</span>
			</button>
		</div>
	);
}