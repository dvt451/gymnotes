import React from 'react'
import { colors } from '../../../../styles/commonStyle'
import { FaPause } from "react-icons/fa";
import { FaPlay } from "react-icons/fa";

const localColors = {
	neonGreen: '#92E33C',
	neonYellow: '#FFCC00',
	darkBg: '#0C0E14',
	darkSurface: '#171c27',
}

export default function TimerActions({
	showTimer,
	isRunning,
	isPaused,
	isFinished,
	isReset,
	onStart,
	onStop,
	onPause,
	onResume,
	onReset
}) {
	return (
		<div style={{
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			gap: '18px',
			margin: '16px 0 20px',
			position: 'relative',
			zIndex: 2,
		}}>
			{showTimer ? (
				// Timer actions
				<>
					<button onClick={onStop} style={{
						background: colors.labelBG,
						border: 'none',
						borderRadius: '60px',
						padding: '14px 26px',
						fontWeight: 600,
						fontSize: '1rem',
						color: colors.white,
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '8px',
						cursor: 'pointer',
						boxShadow: `0 4px 14px rgba(0,0,0,0.6), 0 0 0 1px ${localColors.neonGreen}11`,
						flex: 1,
						maxWidth: '130px',
						letterSpacing: '0.4px',
						transition: 'all 0.15s',
					}}>
						Set
					</button>

					{isFinished ? (
						// Show RESTART button when finished
						<button onClick={onResume} style={{
							background: `linear-gradient(145deg, ${localColors.neonYellow}, #f5b800)`,
							border: 'none',
							borderRadius: '60px',
							padding: '14px 26px',
							fontWeight: 700,
							fontSize: '1rem',
							color: localColors.darkBg,
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '8px',
							cursor: 'pointer',
							boxShadow: `0 8px 28px ${localColors.neonYellow}44, 0 0 0 1px ${localColors.neonYellow}33`,
							flex: 1,
							maxWidth: '130px',
							letterSpacing: '0.4px',
							transition: 'all 0.15s',
						}}>
							<span>↻</span> RESTART
						</button>
					) : isRunning ? (
						// Show PAUSE button when running
						<button onClick={onPause} style={{
							background: `linear-gradient(145deg, ${localColors.neonYellow}, #f5b800)`,
							border: 'none',
							borderRadius: '60px',
							padding: '14px 26px',
							fontWeight: 700,
							fontSize: '1rem',
							color: localColors.darkBg,
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '8px',
							cursor: 'pointer',
							boxShadow: `0 8px 28px ${localColors.neonYellow}44, 0 0 0 1px ${localColors.neonYellow}33`,
							flex: 1,
							maxWidth: '130px',
							letterSpacing: '0.4px',
							transition: 'all 0.15s',
						}}>
							<FaPause /> PAUSE
						</button>
					) : isPaused ? (
						// Show RESUME button when paused
						<button onClick={onResume} style={{
							background: `linear-gradient(145deg, ${localColors.neonGreen}, #78c92a)`,
							border: 'none',
							borderRadius: '60px',
							padding: '14px 26px',
							fontWeight: 700,
							fontSize: '1rem',
							color: localColors.darkBg,
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '8px',
							cursor: 'pointer',
							boxShadow: `0 8px 28px ${localColors.neonGreen}44, 0 0 0 1px ${localColors.neonGreen}33`,
							flex: 1,
							maxWidth: '130px',
							letterSpacing: '0.4px',
							transition: 'all 0.15s',
						}}>
							<span
								style={{
									display: 'inline-flex',
									alignItems: 'center',
									justifyContent: 'center',
								}}
							><FaPlay /></span> RESUME
						</button>
					) : isReset ? (
						// Show START button when reset
						<button onClick={onResume} style={{
							background: `linear-gradient(145deg, ${localColors.neonGreen}, #78c92a)`,
							border: 'none',
							borderRadius: '60px',
							padding: '14px 26px',
							fontWeight: 700,
							fontSize: '1rem',
							color: localColors.darkBg,
							display: 'inline-flex',
							alignItems: 'center',
							justifyContent: 'center',
							gap: '8px',
							cursor: 'pointer',
							boxShadow: `0 8px 28px ${localColors.neonGreen}44, 0 0 0 1px ${localColors.neonGreen}33`,
							flex: 1,
							maxWidth: '130px',
							letterSpacing: '0.4px',
							transition: 'all 0.15s',
						}}>
							<span>▶</span> START
						</button>
					) : null}

					<button onClick={onReset} style={{
						background: localColors.darkSurface,
						border: 'none',
						borderRadius: '60px',
						width: '58px',
						height: '58px',
						padding: 0,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'center',
						fontSize: '1.6rem',
						boxShadow: `0 4px 14px rgba(0,0,0,0.6), 0 0 0 1px ${localColors.neonGreen}11`,
						color: '#d3dae8',
						cursor: 'pointer',
						transition: 'all 0.15s',
					}}>
						<span>↺</span>
					</button>
				</>
			) : (
				// Settings actions
				<div style={{
					display: 'flex',
					justifyContent: 'center',
					width: '100%',
				}}>
					<button onClick={onStart} style={{
						background: `linear-gradient(145deg, ${localColors.neonGreen}, #78c92a)`,
						border: 'none',
						borderRadius: '60px',
						padding: '14px 36px',
						fontWeight: 700,
						fontSize: '1.1rem',
						color: localColors.darkBg,
						display: 'inline-flex',
						alignItems: 'center',
						justifyContent: 'center',
						gap: '10px',
						cursor: 'pointer',
						boxShadow: `0 8px 28px ${localColors.neonGreen}44, 0 0 0 1px ${localColors.neonGreen}33`,
						flex: 1,
						maxWidth: '200px',
						letterSpacing: '0.6px',
						transition: 'all 0.15s',
					}}>
						<FaPlay /> START
					</button>
				</div>
			)}
		</div>
	)
}