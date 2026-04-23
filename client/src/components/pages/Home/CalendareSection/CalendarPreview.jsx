import React from 'react';
import { colors } from '../../../../styles/commonStyle';
import { MONTH_LABEL, WEEKDAY_SHORT, formatDateKey } from './calendarUtils';

export default function CalendarPreview({
	calendarStyles,
	currentWeekDays,
	mainColor,
	onOpenCalendar,
	today,
	todayKey,
	trainingDates
}) {
	const activeColor = colors.blueLight;
	const trainingDaySet = new Set(trainingDates);
	const isMobile = window.innerWidth <= 600;

	return (
		<button type="button" style={calendarStyles.previewCard} onClick={onOpenCalendar}>
			<div style={calendarStyles.weekGrid}>
				{currentWeekDays.map((day) => {
					const dayKey = formatDateKey(day);
					const isToday = dayKey === todayKey;
					const hasTraining = trainingDaySet.has(dayKey);

					return (
						<div
							key={dayKey}
							style={{
								...calendarStyles.weekDayCard,
								...(isMobile ? calendarStyles.weekDayCardMobile : {}),
								...(hasTraining
									? {
										borderColor: `transparent`,
									}
									: {}),
								...(isToday
									? {
										borderColor: mainColor || colors.green,
										boxShadow: `0 0 0 1px ${mainColor || colors.green} inset`,
										backgroundColor: `${mainColor || colors.green}33`,
									}
									: {}),
							}}
						>
							<span style={calendarStyles.weekDayLabel}>{WEEKDAY_SHORT.format(day)}</span>
							<span
								style={{
									...calendarStyles.weekDayNumber,
									...(isMobile ? calendarStyles.weekDayNumberSmall : {}),
									color: isToday
										? (hasTraining ? activeColor : mainColor || colors.green)
										: (hasTraining ? activeColor : colors.white),
								}}
							>
								{day.getDate()}
							</span>

							{hasTraining ? (
								<span style={calendarStyles.trainingDot}></span>
							) : (
								<span style={{ ...calendarStyles.trainingDot, opacity: 0 }}></span>
							)}
						</div>
					);
				})}
			</div>
		</button>
	);
}
