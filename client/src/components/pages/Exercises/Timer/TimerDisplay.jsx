import React from 'react'
import { FaPause } from 'react-icons/fa'

const localColors = {
	neonGreen: '#92E33C',
	neonYellow: '#FFCC00',
	darkCard: '#0F121A',
	darkSurface: '#171c27',
	textMuted: '#7b849c',
}

export default function TimerDisplay({ time, isRunning, isPaused, isFinished, isReset, formatTime, totalTime }) {
	// CONFIGURABLE RADIUS - Change this one value to resize everything
	const RADIUS = 100 // Change this to resize the circle (e.g., 100, 140, 160)

	// Calculate derived values from radius
	const diameter = RADIUS * 2
	const size = diameter + 40 // Add padding for glow effects
	const center = size / 2
	const circumference = 2 * Math.PI * RADIUS
	const fontSize = Math.round(RADIUS * 0.32) // Responsive font size
	const strokeWidth = Math.round(RADIUS * 0.067) // Responsive stroke width
	const glowWidth = Math.round(RADIUS * 0.133) // Responsive glow width
	const dotSize = Math.round(RADIUS * 0.058) // Responsive dot size
	const pauseIconSize = Math.round(RADIUS * 0.8) // Responsive pause icon

	// Calculate percentage for the circle
	const percentage = totalTime > 0 ? (time / totalTime) * 100 : 0
	const strokeDashoffset = circumference - (percentage / 100) * circumference

	// Determine color based on state
	const circleColor = isFinished ? localColors.neonYellow : (isReset ? localColors.neonGreen : localColors.neonGreen)

	return (
		<div style={{
			background: localColors.darkCard,
			borderRadius: '48px',
			padding: '26px 12px 18px',
			marginBottom: '22px',
			boxShadow: `inset 0 8px 20px rgba(0,0,0,0.7), 0 0 0 1px ${localColors.neonGreen}11`,
			position: 'relative',
			zIndex: 2,
			border: `1px solid ${localColors.neonGreen}11`,
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
			minHeight: `${size + 40}px`,
			opacity: isPaused ? 0.5 : 1,
			transition: 'opacity 0.3s ease',
		}}>
			{/* SVG Circle Timer */}
			<div style={{
				position: 'relative',
				width: `${size}px`,
				height: `${size}px`,
			}}>
				<svg
					width={size}
					height={size}
					viewBox={`0 0 ${size} ${size}`}
					style={{
						transform: 'rotate(-90deg)',
					}}
				>
					{/* Background circle */}
					<circle
						cx={center}
						cy={center}
						r={RADIUS}
						fill="none"
						stroke="#252b38"
						strokeWidth={strokeWidth}
					/>
					{/* Progress circle */}
					<circle
						cx={center}
						cy={center}
						r={RADIUS}
						fill="none"
						stroke={circleColor}
						strokeWidth={strokeWidth}
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						style={{
							transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease',
						}}
					/>
					{/* Glow effect */}
					<circle
						cx={center}
						cy={center}
						r={RADIUS}
						fill="none"
						stroke={circleColor}
						strokeWidth={glowWidth}
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={strokeDashoffset}
						opacity="0.1"
						style={{
							transition: 'stroke-dashoffset 0.5s ease, stroke 0.5s ease',
						}}
						filter="blur(8px)"
					/>
				</svg>

				{/* Timer text in center */}
				<div style={{
					position: 'absolute',
					top: '50%',
					left: '50%',
					transform: 'translate(-50%, -50%)',
					textAlign: 'center',
				}}>
					<div style={{
						fontSize: '30px',
						fontWeight: 700,
						letterSpacing: '4px',
						fontVariantNumeric: 'tabular-nums',
						color: isFinished ? localColors.neonYellow : '#ffffff',
						textShadow: isFinished ?
							`0 0 40px ${localColors.neonYellow}44` :
							`0 0 40px ${localColors.neonGreen}33`,
					}}>
						{formatTime(time)}
					</div>

					{/* Timer indicator below time */}
					<div style={{
						color: isFinished ? localColors.neonYellow : localColors.neonGreen,
						fontSize: `10px`,
						textTransform: 'uppercase',
						letterSpacing: '2px',
						fontWeight: 600,
						marginTop: '4px',
						textShadow: isFinished ?
							`0 0 20px ${localColors.neonYellow}44` :
							`0 0 20px ${localColors.neonGreen}44`,
					}}>
						<span style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: '6px',
						}}>
							<span style={{
								display: 'inline-block',
								width: `${dotSize}px`,
								height: `${dotSize}px`,
								background: isFinished ? localColors.neonYellow : localColors.neonGreen,
								borderRadius: '50%',
								boxShadow: isFinished ?
									`0 0 12px ${localColors.neonYellow}88` :
									`0 0 12px ${localColors.neonGreen}88`,
								opacity: 0.9,
								animation: isRunning && !isPaused && !isFinished ? 'pulse-dot 1.4s infinite' : 'none',
							}}></span>
							{isFinished ? 'COMPLETED' : (isReset ? 'READY' : 'TIMER')}
						</span>
					</div>
				</div>

				{/* Pause overlay indicator */}
				{isPaused && (
					<div style={{
						position: 'absolute',
						top: '50%',
						left: '50%',
						transform: 'translate(-50%, -50%)',
						fontSize: `${pauseIconSize}px`,
						fontWeight: 700,
						color: localColors.neonYellow,
						textShadow: `0 0 60px ${localColors.neonYellow}88`,
						opacity: 0.5,
						pointerEvents: 'none',
						letterSpacing: '4px',
						marginTop: `${fontSize * 0.2}px`,
					}}>
					</div>
				)}
			</div>
		</div>
	)
}