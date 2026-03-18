export const PROGRESS_RING_SIZE = 220;
export const PROGRESS_RING_STROKE = 16;
export const PROGRESS_RING_RADIUS = (PROGRESS_RING_SIZE - PROGRESS_RING_STROKE) / 2;
export const PROGRESS_RING_CIRCUMFERENCE = 2 * Math.PI * PROGRESS_RING_RADIUS;

export const formatWeight = (value) => `${Number(value || 0).toFixed(1)} kg`;

export const formatPercent = (value) => {
	if (value === null || value === undefined) return 'No baseline';
	return `${value > 0 ? '+' : ''}${Number(value).toFixed(1)}%`;
};

export const formatDate = (value) => {
	if (!value) return 'No data';
	return new Date(value).toLocaleDateString();
};

export const getValueStyle = (styles, value) => {
	if (value === null || value === undefined) return styles.statValue;
	if (value > 0) return { ...styles.statValue, ...styles.statValuePositive };
	if (value < 0) return { ...styles.statValue, ...styles.statValueNegative };
	return styles.statValue;
};

export const getProgressVisualValue = (value) => {
	if (value === null || value === undefined) return 0;
	return Math.max(0, Math.min(Number(value) || 0, 100));
};

export const getProgressTone = (styles, value) => {
	if (value === null || value === undefined) return styles.progressNeutral;
	if (value > 0) return styles.progressPositive;
	if (value < 0) return styles.progressNegative;
	return styles.progressNeutral;
};
