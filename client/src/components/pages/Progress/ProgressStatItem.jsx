import React from 'react';

export default function ProgressStatItem({ label, value, valueStyle, styles }) {
	return (
		<div style={styles.statItem}>
			<span style={styles.statLabel}>{label}</span>
			<strong style={valueStyle || styles.statValue}>{value}</strong>
		</div>
	);
}
