import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../../../context/AuthContext';
import { GlobalContext } from '../../../../context/GlobalContext';
import { createCommonStyle } from '../../../../styles/commonStyle';
import CalendarModal from './CalendarModal';
import CalendarPreview from './CalendarPreview';
import { createCalendarStyles } from './calendarStyles';
import {
	buildCalendarDays,
	buildWeekDays,
	MONTH_LABEL,
	extractDateItems,
	formatDateKey,
	parseDateKey
} from './calendarUtils';

export default function Calendare() {
	const { BASE_URL, userToken } = useContext(AuthContext);
	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);
	const calendarStyles = createCalendarStyles(mainColor);
	const [trainingDates, setTrainingDates] = useState([]);
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState('');
	const [isCalendarOpen, setIsCalendarOpen] = useState(false);
	const [visibleMonth, setVisibleMonth] = useState(() => {
		const today = new Date();
		return new Date(today.getFullYear(), today.getMonth(), 1);
	});

	const today = new Date();
	const todayKey = formatDateKey(today);
	const currentWeekDays = useMemo(() => buildWeekDays(parseDateKey(todayKey)), [todayKey]);
	const calendarDays = useMemo(() => buildCalendarDays(visibleMonth), [visibleMonth]);
	const weekdayHeaders = useMemo(() => buildWeekDays(parseDateKey('2026-04-20')), []);

	const fetchTrainingDates = useCallback(async () => {
		if (!userToken) return;

		setIsLoading(true);
		setError('');

		try {
			const headers = {
				Authorization: `Bearer ${userToken}`,
			};

			const trainingsResponse = await fetch(`${BASE_URL}/api/trainings`, { headers });
			if (!trainingsResponse.ok) {
				throw new Error('Failed to load trainings');
			}

			const trainings = await trainingsResponse.json();

			if (!Array.isArray(trainings) || trainings.length === 0) {
				setTrainingDates([]);
				return;
			}

			const datePayloads = await Promise.all(
				trainings.map(async (training) => {
					const response = await fetch(`${BASE_URL}/api/trainings/${training._id}/dates`, { headers });
					if (!response.ok) {
						throw new Error(`Failed to load dates for "${training.name}"`);
					}
					return response.json();
				})
			);

			const uniqueDates = new Set();

			datePayloads.forEach((payload) => {
				extractDateItems(payload).forEach((item) => {
					if (item?.date) {
						uniqueDates.add(String(item.date).split('T')[0]);
					}
				});
			});

			setTrainingDates(Array.from(uniqueDates).sort());
		} catch (fetchError) {
			console.error('Failed to load calendar dates:', fetchError);
			setError(fetchError.message || 'Failed to load training dates');
		} finally {
			setIsLoading(false);
		}
	}, [BASE_URL, userToken]);

	useEffect(() => {
		fetchTrainingDates();
	}, [fetchTrainingDates]);

	const openCalendar = () => {
		const todayMonth = new Date();
		setVisibleMonth(new Date(todayMonth.getFullYear(), todayMonth.getMonth(), 1));
		setIsCalendarOpen(true);
	};

	const closeCalendar = () => setIsCalendarOpen(false);

	const goToPreviousMonth = () => {
		setVisibleMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
	};

	const goToNextMonth = () => {
		setVisibleMonth((currentMonth) => new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
	};

	return (
		<>
			<div style={{ ...commonStyle.commonSection, ...calendarStyles.calendareSection }}>
				<div style={commonStyle.titleHeader}>
					<h2 style={commonStyle.title}>Schedule</h2>
					<div>
						<p style={calendarStyles.previewMonth}>{MONTH_LABEL.format(today)}</p>
					</div>
				</div>
				<CalendarPreview
					calendarStyles={calendarStyles}
					currentWeekDays={currentWeekDays}
					mainColor={mainColor}
					onOpenCalendar={openCalendar}
					today={today}
					todayKey={todayKey}
					trainingDates={trainingDates}
				/>
			</div>
			<CalendarModal
				calendarDays={calendarDays}
				calendarStyles={calendarStyles}
				error={error}
				isCalendarOpen={isCalendarOpen}
				isLoading={isLoading}
				mainColor={mainColor}
				onCloseCalendar={closeCalendar}
				onNextMonth={goToNextMonth}
				onPreviousMonth={goToPreviousMonth}
				todayKey={todayKey}
				trainingDates={trainingDates}
				visibleMonth={visibleMonth}
				weekdayHeaders={weekdayHeaders}
			/>
		</>
	);
}
