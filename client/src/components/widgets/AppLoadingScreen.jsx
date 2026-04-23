import React from 'react';
import InlineSpinner from './InlineSpinner';

export default function AppLoadingScreen({
	title = 'LiftLog',
	text = 'Loading your workspace...',
}) {
	return (
		<div className="app-loading-screen">
			<div className="app-loading-shell">
				<div className="app-loading-logo">
					<img src="/MucleBrandLogo.svg" alt="LiftLog" />
				</div>
				<div className="app-loading-title">{title}</div>
				<InlineSpinner size={28} thickness={3} color="#92E33C" />
				<p className="app-loading-text">{text}</p>
			</div>
		</div>
	);
}
