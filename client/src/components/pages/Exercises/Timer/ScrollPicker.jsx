import React, { useState, useRef } from 'react'

// Custom colors matching the design
const localColors = {
	neonGreen: '#92E33C',
	darkBg: '#0C0E14',
	textLight: '#eef3fc',
	textMuted: '#7b849c',
}

export default function ScrollPicker({ value, onChange, min, max, label }) {
	const [isDragging, setIsDragging] = useState(false)
	const [startY, setStartY] = useState(0)
	const [scrollOffset, setScrollOffset] = useState(0)
	const containerRef = useRef(null)
	const itemHeight = 44
	const visibleItems = 3

	const items = []
	for (let i = min; i <= max; i++) {
		items.push(i)
	}

	const getSelectedIndex = () => {
		return items.indexOf(value)
	}

	const handleMouseDown = (e) => {
		setIsDragging(true)
		setStartY(e.clientY)
		setScrollOffset(0)
	}

	const handleMouseMove = (e) => {
		if (!isDragging) return
		const deltaY = e.clientY - startY
		const newOffset = scrollOffset + deltaY
		setScrollOffset(newOffset)
		setStartY(e.clientY)

		const itemIndex = Math.round(-newOffset / itemHeight)
		const newIndex = Math.max(0, Math.min(items.length - 1, getSelectedIndex() + itemIndex))
		if (items[newIndex] !== undefined && items[newIndex] !== value) {
			onChange(items[newIndex])
		}
	}

	const handleMouseUp = () => {
		setIsDragging(false)
		setScrollOffset(0)
	}

	const handleTouchStart = (e) => {
		const touch = e.touches[0]
		setIsDragging(true)
		setStartY(touch.clientY)
		setScrollOffset(0)
	}

	const handleTouchMove = (e) => {
		if (!isDragging) return
		const touch = e.touches[0]
		const deltaY = touch.clientY - startY
		const newOffset = scrollOffset + deltaY
		setScrollOffset(newOffset)
		setStartY(touch.clientY)

		const itemIndex = Math.round(-newOffset / itemHeight)
		const newIndex = Math.max(0, Math.min(items.length - 1, getSelectedIndex() + itemIndex))
		if (items[newIndex] !== undefined && items[newIndex] !== value) {
			onChange(items[newIndex])
		}
	}

	const handleTouchEnd = () => {
		setIsDragging(false)
		setScrollOffset(0)
	}

	const centeredIndex = Math.round(getSelectedIndex())

	return (
		<div style={{
			display: 'flex',
			flexDirection: 'column',
			alignItems: 'center',
			width: '70px',
			position: 'relative',
		}}>
			<label style={{
				color: localColors.textMuted,
				fontSize: '0.55rem',
				textTransform: 'uppercase',
				letterSpacing: '0.5px',
				marginBottom: '4px',
				fontWeight: 600,
			}}>
				{label}
			</label>
			<div
				ref={containerRef}
				style={{
					height: `${itemHeight * visibleItems}px`,
					overflow: 'hidden',
					position: 'relative',
					width: '100%',
					cursor: 'pointer',
					borderRadius: '12px',
					background: localColors.darkBg,
					border: `1px solid ${localColors.neonGreen}22`,
				}}
				onMouseDown={handleMouseDown}
				onMouseMove={handleMouseMove}
				onMouseUp={handleMouseUp}
				onMouseLeave={handleMouseUp}
				onTouchStart={handleTouchStart}
				onTouchMove={handleTouchMove}
				onTouchEnd={handleTouchEnd}
			>
				<div style={{
					position: 'absolute',
					top: '50%',
					left: '0',
					right: '0',
					height: `${itemHeight}px`,
					transform: 'translateY(-50%)',
					background: `${localColors.neonGreen}11`,
					borderTop: `1px solid ${localColors.neonGreen}33`,
					borderBottom: `1px solid ${localColors.neonGreen}33`,
					pointerEvents: 'none',
					borderRadius: '4px',
				}} />

				<div style={{
					transform: `translateY(${(visibleItems - 1) * itemHeight / 2 - centeredIndex * itemHeight + (isDragging ? scrollOffset : 0)}px)`,
					transition: isDragging ? 'none' : 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
					willChange: 'transform',
				}}>
					{items.map((item, index) => (
						<div
							key={item}
							style={{
								height: `${itemHeight}px`,
								display: 'flex',
								alignItems: 'center',
								justifyContent: 'center',
								color: index === centeredIndex ? localColors.textLight : localColors.textMuted,
								fontSize: index === centeredIndex ? '1.1rem' : '0.9rem',
								fontWeight: index === centeredIndex ? 700 : 400,
								transition: 'all 0.2s',
								textShadow: index === centeredIndex ? `0 0 20px ${localColors.neonGreen}33` : 'none',
							}}
						>
							{item.toString().padStart(2, '0')}
						</div>
					))}
				</div>
			</div>
		</div>
	)
}