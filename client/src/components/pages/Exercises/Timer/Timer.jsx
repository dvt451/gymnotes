import React, { useState, useEffect, useRef, useContext } from 'react'
import ScrollPicker from './ScrollPicker'
import TimerDisplay from './TimerDisplay'
import TimerSettings from './TimerSettings'
import TimerActions from './TimerActions'
import { FaPause } from 'react-icons/fa'
import { GlobalContext } from '../../../../context/GlobalContext'
import TimerButton from '../TimerButton'

// Custom colors matching the design
const localColors = {
	neonGreen: '#92E33C',
	neonYellow: '#FFCC00',
	darkBg: '#0C0E14',
	darkCard: '#0F121A',
	darkSurface: '#171c27',
	textLight: '#eef3fc',
	textMuted: '#7b849c',
}

export default function Timer() {
	// Timer settings
	const [minutes, setMinutes] = useState(1)
	const [seconds, setSeconds] = useState(24)
	const [currentTime, setCurrentTime] = useState(84)
	const [totalTime, setTotalTime] = useState(84)
	const [isRunning, setIsRunning] = useState(false)
	const [isPaused, setIsPaused] = useState(false)
	const [isFinished, setIsFinished] = useState(false)
	const [rounds, setRounds] = useState(0)
	const [showTimer, setShowTimer] = useState(false)
	const [isReset, setIsReset] = useState(false) // Track reset state
	const intervalRef = useRef(null)
	const { timerDisplayState, setTimerDisplayState } = useContext(GlobalContext);

	// Calculate total seconds from minutes and seconds
	const getTotalSeconds = (mins, secs) => {
		return mins * 60 + secs
	}

	// Format time as MM:SS
	const formatTime = (seconds) => {
		const mins = Math.floor(seconds / 60)
		const secs = seconds % 60
		return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
	}

	// Handle start
	const handleStart = () => {
		const total = getTotalSeconds(minutes, seconds)
		setCurrentTime(total)
		setTotalTime(total)
		setShowTimer(true)
		setIsRunning(true)
		setIsPaused(false)
		setIsFinished(false)
		setIsReset(false)
		setRounds(0)
	}

	// Handle pause
	const handlePause = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
		setIsPaused(true)
		setIsRunning(false)
	}

	// Handle resume
	const handleResume = () => {
		if (isFinished) {
			// If finished, restart timer
			const total = getTotalSeconds(minutes, seconds)
			setCurrentTime(total)
			setTotalTime(total)
			setIsFinished(false)
			setIsReset(false)
			setRounds(0)
			setIsRunning(true)
			setIsPaused(false)
		} else if (isReset) {
			// If reset, start timer
			const total = getTotalSeconds(minutes, seconds)
			setCurrentTime(total)
			setTotalTime(total)
			setIsReset(false)
			setIsRunning(true)
			setIsPaused(false)
		} else {
			setIsPaused(false)
			setIsRunning(true)
		}
	}

	// Handle stop - stops timer and goes back to settings
	const handleStop = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
		setIsRunning(false)
		setIsPaused(false)
		setIsFinished(false)
		setIsReset(false)
		const total = getTotalSeconds(minutes, seconds)
		setCurrentTime(total)
		setTotalTime(total)
		setRounds(0)
		setShowTimer(false)
	}

	// Handle reset - reset timer but stay on timer display, show START button
	const handleReset = () => {
		if (intervalRef.current) {
			clearInterval(intervalRef.current)
			intervalRef.current = null
		}
		setIsRunning(false)
		setIsPaused(false)
		setIsFinished(false)
		setIsReset(true) // Set reset state to show START button
		const total = getTotalSeconds(minutes, seconds)
		setCurrentTime(total)
		setTotalTime(total)
		setRounds(0)
	}

	// Timer logic
	useEffect(() => {
		if (isRunning && showTimer) {
			intervalRef.current = window.setInterval(() => {
				setCurrentTime((prevTime) => {
					// If time is 1 or less, stop at 00:00
					if (prevTime <= 1) {
						// Clear interval immediately
						if (intervalRef.current) {
							clearInterval(intervalRef.current)
							intervalRef.current = null
						}
						setIsRunning(false)
						setIsFinished(true)
						setIsReset(false)
						return 0
					}
					return prevTime - 1
				})
			}, 1000)
		} else {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
		}

		return () => {
			if (intervalRef.current) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
		}
	}, [isRunning, showTimer])

	// Update totalTime when time changes
	useEffect(() => {
		if (!isRunning && !isPaused && !isFinished && !isReset) {
			const total = getTotalSeconds(minutes, seconds)
			setTotalTime(total)
		}
	}, [minutes, seconds, isRunning, isPaused, isFinished, isReset])

	return (
		<div style={{
			position: 'fixed',
			zIndex: 100,
			left: '0',
			bottom: timerDisplayState ? '0' : '-100%',
			width: '100%',
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'center',
			transition: 'all 0.3s ease-in-out',
		}}>
			<TimerButton />
			<div style={{
				width: '100%',
				background: localColors.darkBg,
				borderRadius: '56px 56px 0 0',
				padding: '16px 10px 24px',
				boxShadow: `0 40px 70px rgba(0,0,0,0.9), 0 0 0 2px ${localColors.neonGreen}22, 0 0 0 6px #13171f`,
			}}>
				<div style={{
					background: localColors.darkBg,
					borderRadius: '40px',
					padding: '26px 18px 30px',
					boxShadow: `inset 0 0 0 1px ${localColors.neonGreen}11`,
					position: 'relative',
					overflow: 'hidden',
				}}>
					{/* Header */}
					<div style={{
						display: 'flex',
						justifyContent: 'space-between',
						alignItems: 'center',
						marginBottom: '16px',
					}}>
						<div style={{
							color: localColors.textMuted,
							fontSize: '0.8rem',
							fontWeight: 500,
							textTransform: 'uppercase',
							letterSpacing: '1px',
						}}>
							{showTimer ? (
								isFinished ? '✅ FINISHED' : (isPaused ? <FaPause /> + `PAUSED` : (isReset ? 'READY' : 'TIMER'))
							) : 'SET TIMER'}
						</div>
						<div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', flex: '1 1 auto' }}>
							<button onClick={() => setTimerDisplayState(false)}>
								Back
							</button>
						</div>
						{/* <div style={{
							display: 'flex',
							alignItems: 'center',
							gap: '8px',
						}}>
							{showTimer && rounds > 0 && !isFinished && (
								<span style={{
									color: localColors.textMuted,
									fontSize: '0.7rem',
								}}>
									Round {rounds}
								</span>
							)}
							{showTimer && isFinished && (
								<span style={{
									color: localColors.neonGreen,
									fontSize: '0.7rem',
									fontWeight: 600,
								}}>
									✓ Done!
								</span>
							)}
							{showTimer && isReset && !isFinished && (
								<span style={{
									color: localColors.neonYellow,
									fontSize: '0.7rem',
									fontWeight: 600,
								}}>
									Ready
								</span>
							)}
						</div> */}
					</div>

					{/* Timer Display or Settings */}
					{showTimer ? (
						<TimerDisplay
							time={currentTime}
							totalTime={totalTime}
							isRunning={isRunning || isPaused}
							isPaused={isPaused}
							isFinished={isFinished}
							isReset={isReset}
							formatTime={formatTime}
						/>
					) : (
						<TimerSettings
							minutes={minutes}
							setMinutes={setMinutes}
							seconds={seconds}
							setSeconds={setSeconds}
							formatTime={formatTime}
							getTotalSeconds={getTotalSeconds}
						/>
					)}

					{/* Actions */}
					<TimerActions
						showTimer={showTimer}
						isRunning={isRunning}
						isPaused={isPaused}
						isFinished={isFinished}
						isReset={isReset}
						onStart={handleStart}
						onStop={handleStop}
						onPause={handlePause}
						onResume={handleResume}
						onReset={handleReset}
					/>
				</div>
			</div>

			{/* Keyframe animation for pulse */}
			<style>{`
				@keyframes pulse-dot {
					0% { opacity: 0.6; transform: scale(1); }
					50% { opacity: 1; transform: scale(1.4); }
					100% { opacity: 0.6; transform: scale(1); }
				}
			`}</style>
		</div >
	)
}