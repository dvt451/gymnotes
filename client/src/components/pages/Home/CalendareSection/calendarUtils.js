export const WEEKDAY_SHORT = new Intl.DateTimeFormat('en-US', { weekday: 'short' });
export const MONTH_LABEL = new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' });

const padNumber = (value) => String(value).padStart(2, '0');

export const formatDateKey = (date) => {
	return `${date.getFullYear()}-${padNumber(date.getMonth() + 1)}-${padNumber(date.getDate())}`;
};

export const parseDateKey = (dateKey) => {
	const [year, month, day] = String(dateKey || '').split('-').map(Number);
	return new Date(year, (month || 1) - 1, day || 1);
};

export const startOfWeek = (date) => {
	const weekStart = new Date(date);
	const dayIndex = (weekStart.getDay() + 6) % 7;
	weekStart.setDate(weekStart.getDate() - dayIndex);
	return weekStart;
};

export const addDays = (date, amount) => {
	const nextDate = new Date(date);
	nextDate.setDate(nextDate.getDate() + amount);
	return nextDate;
};

export const buildWeekDays = (anchorDate) => {
	const weekStart = startOfWeek(anchorDate);
	return Array.from({ length: 7 }, (_, index) => addDays(weekStart, index));
};

export const buildCalendarDays = (visibleMonth) => {
	const firstDayOfMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1);
	const monthStartOffset = (firstDayOfMonth.getDay() + 6) % 7;
	const firstVisibleDay = new Date(firstDayOfMonth);
	firstVisibleDay.setDate(firstVisibleDay.getDate() - monthStartOffset);

	return Array.from({ length: 42 }, (_, index) => addDays(firstVisibleDay, index));
};

export const extractDateItems = (payload) => {
	if (Array.isArray(payload)) return payload;
	if (Array.isArray(payload?.dates)) return payload.dates;
	return [];
};
