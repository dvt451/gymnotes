import React from 'react'
import ScrollPicker from './ScrollPicker'

const localColors = {
	neonGreen: '#92E33C',
	neonYellow: '#FFCC00',
	darkCard: '#0F121A',
	textMuted: '#7b849c',
}

export default function TimerSettings({
	minutes, setMinutes,
	seconds, setSeconds,
	formatTime, getTotalSeconds
}) {
	return (
		<div style={{
			background: localColors.darkCard,
			borderRadius: '48px',
			padding: '24px 12px',
			marginBottom: '22px',
			boxShadow: `inset 0 8px 20px rgba(0,0,0,0.7), 0 0 0 1px ${localColors.neonGreen}11`,
			position: 'relative',
			zIndex: 2,
			border: `1px solid ${localColors.neonGreen}11`,
		}}>
			<div style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				gap: '16px',
			}}>
				{/* Minutes */}
				<ScrollPicker
					value={minutes}
					onChange={setMinutes}
					min={0}
					max={99}
					label="MIN"
				/>

				<span style={{
					color: localColors.textMuted,
					fontSize: '2rem',
					fontWeight: 300,
					marginTop: '16px'
				}}>:</span>

				{/* Seconds */}
				<ScrollPicker
					value={seconds}
					onChange={setSeconds}
					min={0}
					max={59}
					label="SEC"
				/>
			</div>
		</div>
	)
}