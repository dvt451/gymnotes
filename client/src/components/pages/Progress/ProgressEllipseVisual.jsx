import React from 'react';
import {
	formatPercent,
	getProgressTone,
	getProgressVisualValue,
} from './progressUtils';

export default function ProgressEllipseVisual({
	progressPercent,
	progressStyles,
	label = false,
	size = 220,
	stroke = 24,
	valueFontSize = 32,
	labelFontSize = 24,
	showPercentSign = true,
	centerContent,
}) {
	const visualProgress = getProgressVisualValue(progressPercent);
	const radius = (size - stroke) / 2;
	const circumference = 2 * Math.PI * radius;
	const strokeOffset = circumference * (1 - visualProgress / 100);

	return (
		<div
			style={{
				...progressStyles.ellipseProgressWrap,
				width: size,
				height: size,
			}}
		>
			<svg
				width={size}
				height={size}
				viewBox={`0 0 ${size} ${size}`}
				style={progressStyles.ellipseProgressSvg}
			>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					style={{
						...progressStyles.ellipseProgressTrack,
						strokeWidth: stroke,
					}}
				/>
				<circle
					cx={size / 2}
					cy={size / 2}
					r={radius}
					strokeDasharray={circumference}
					strokeDashoffset={strokeOffset}
					style={{
						...progressStyles.ellipseProgressFill,
						...getProgressTone(progressStyles, progressPercent),
						strokeWidth: stroke,
					}}
				/>
			</svg>
			<div style={progressStyles.ellipseProgressCenter}>
				{centerContent ? (
					centerContent
				) : (
					<>
						<strong
							style={{
								...progressStyles.ellipseProgressValue,
								fontSize: valueFontSize,
							}}
						>
							{showPercentSign ? formatPercent(progressPercent) : formatPercent(progressPercent)}
						</strong>
						{label && (
							<span
								style={{
									...progressStyles.ellipseProgressLabel,
									fontSize: labelFontSize,
								}}
							>
								{label}
							</span>
						)}
					</>
				)}
			</div>
		</div>
	);
}
