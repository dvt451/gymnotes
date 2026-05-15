import React from 'react';

export default function SectionSkeleton({
	showHeader = true,
	headerWidth = '38%',
	headerAsideWidth = '22%',
	lines = 0,
	lineHeight = 18,
	lineGap = 10,
	cards = 0,
	cardHeight = 88,
	cardGap = 12,
	columns = 1,
	style = {},
	contentStyle = {},
}) {
	const gridColumns = typeof columns === 'number'
		? `repeat(${columns}, minmax(0, 1fr))`
		: columns;

	return (
		<div style={style}>
			{showHeader && (
				<div style={{
					display: 'flex',
					justifyContent: 'space-between',
					alignItems: 'center',
					gap: '12px',
					marginBottom: '16px',
				}}>
					<div className="ui-skeleton" style={{ width: headerWidth, height: '24px' }}></div>
					<div className="ui-skeleton" style={{ width: headerAsideWidth, height: '16px' }}></div>
				</div>
			)}

			<div style={{
				display: 'flex',
				flexDirection: 'column',
				gap: `${lineGap}px`,
				...contentStyle,
			}}>
				{lines > 0 && Array.from({ length: lines }).map((_, index) => (
					<div
						key={`line-${index}`}
						className="ui-skeleton"
						style={{
							height: `${lineHeight}px`,
							width: index === lines - 1 ? '72%' : '100%',
						}}
					></div>
				))}

				{cards > 0 && (
					<div style={{
						display: 'grid',
						gridTemplateColumns: gridColumns,
						gap: `${cardGap}px`,
					}}>
						{Array.from({ length: cards }).map((_, index) => (
							<div
								key={`card-${index}`}
								className="ui-skeleton"
								style={{ height: `${cardHeight}px` }}
							></div>
						))}
					</div>
				)}
			</div>
		</div>
	);
}
