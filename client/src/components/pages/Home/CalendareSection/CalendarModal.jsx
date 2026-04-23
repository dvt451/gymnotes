import React from 'react';
import { colors } from '../../../../styles/commonStyle';
import Popup from '../../../widgets/Popup';
import { MONTH_LABEL, WEEKDAY_SHORT, formatDateKey } from './calendarUtils';

export default function CalendarModal({
	calendarDays,
	calendarStyles,
	isCalendarOpen,
	isLoading,
	error,
	mainColor,
	onCloseCalendar,
	onNextMonth,
	onPreviousMonth,
	todayKey,
	trainingDates,
	visibleMonth,
	weekdayHeaders
}) {
	const activeColor = colors.blueLight;
	const trainingDaySet = new Set(trainingDates);

	return (
		<Popup isOpen={isCalendarOpen} onClose={onCloseCalendar}>
			<div style={calendarStyles.modal}>
				<div style={calendarStyles.modalHeader}>
					<div>
						<h3 style={calendarStyles.modalTitle}>Training calendar</h3>
					</div>
					<div style={calendarStyles.modalActions}>
						<button type="button" style={calendarStyles.iconButton} onClick={onCloseCalendar}>
							X
						</button>
					</div>
				</div>

				<div style={calendarStyles.calendarShell}>
					<div style={calendarStyles.monthHeader}>
						<button type="button" style={calendarStyles.iconButton} onClick={onPreviousMonth}>
							&lt;
						</button>
						<h4 style={calendarStyles.monthTitle}>{MONTH_LABEL.format(visibleMonth)}</h4>
						<button type="button" style={calendarStyles.iconButton} onClick={onNextMonth}>
							&gt;
						</button>
					</div>

					<div style={calendarStyles.weekdayRow}>
						{weekdayHeaders.map((day) => (
							<div key={day.toISOString()} style={calendarStyles.weekdayCell}>
								{WEEKDAY_SHORT.format(day)}
							</div>
						))}
					</div>

					<div style={calendarStyles.monthGrid}>
						{calendarDays.map((day) => {
							const dayKey = formatDateKey(day);
							const isToday = dayKey === todayKey;
							const hasTraining = trainingDaySet.has(dayKey);
							const isOutsideVisibleMonth = day.getMonth() !== visibleMonth.getMonth();

							return (
								<div
									key={dayKey}
									style={{
										...calendarStyles.monthDay,
										opacity: isOutsideVisibleMonth ? 0.35 : 1,
										...(hasTraining
											? {
												backgroundColor: `${activeColor}22`,
												borderColor: `${activeColor}66`,
											}
											: {}),
										...(isToday
											? {
												borderColor: mainColor || colors.green,
												boxShadow: `0 0 0 1px ${mainColor || colors.green} inset`,
												backgroundColor: `${mainColor || colors.green}22`,
											}
											: {}),
									}}
								>
									<span
										style={{
											...calendarStyles.monthDayNumber,
											color: isToday
												? (hasTraining ? activeColor : mainColor || colors.green)
												: (hasTraining ? activeColor : colors.white),
										}}
									>
										{day.getDate()}
									</span>
									<span style={calendarStyles.monthDayText}> </span>
								</div>
							);
						})}
					</div>
				</div>

				{!isLoading && !error && trainingDates.length === 0 && (
					<p style={calendarStyles.emptyState}>
						No marked days yet. Open any training and add a date to start building your calendar.
					</p>
				)}
			</div>
		</Popup>
	);
}
