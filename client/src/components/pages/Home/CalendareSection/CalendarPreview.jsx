import React from 'react';
import { colors } from '../../../../styles/commonStyle';
import { WEEKDAY_SHORT, formatDateKey } from './calendarUtils';

export default function CalendarPreview({
	calendarStyles,
	currentWeekDays,
	isLoading,
	mainColor,
	onOpenCalendar,
	todayKey,
	trainingDates
}) {
	const activeColor = colors.blueLight;
	const trainingDaySet = new Set(trainingDates);
	const isMobile = window.innerWidth <= 600;

	return (
		<button
			type="button"
			style={{
				...calendarStyles.previewCard,
				cursor: isLoading ? 'wait' : 'pointer',
			}}
			onClick={onOpenCalendar}
			disabled={isLoading}
		>
			<div style={calendarStyles.weekGrid}>
				{currentWeekDays.map((day, index) => {
					const dayKey = formatDateKey(day);
					const isToday = dayKey === todayKey;
					const hasTraining = trainingDaySet.has(dayKey);

					if (isLoading) {
						return (
							<div
								key={`calendar-preview-skeleton-${dayKey}`}
								style={{
									...calendarStyles.weekDayCard,
									...(isMobile ? calendarStyles.weekDayCardMobile : {}),
								}}
							>
								<div
									className="ui-skeleton"
									style={{ width: '65%', height: '12px', borderRadius: '999px' }}
								></div>
								<div
									className="ui-skeleton"
									style={{ width: index % 2 === 0 ? '44%' : '56%', height: '26px', borderRadius: '12px' }}
								></div>
								<div
									className="ui-skeleton"
									style={{ width: '8px', height: '8px', borderRadius: '50%' }}
								></div>
							</div>
						);
					}

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
			{isLoading && (
				<p style={calendarStyles.statusText}>Syncing your training calendar...</p>
			)}
		</button>
	);
}
