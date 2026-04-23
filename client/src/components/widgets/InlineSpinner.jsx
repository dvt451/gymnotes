import React from 'react';

export default function InlineSpinner({
	size = 16,
	thickness = 2,
	color = 'currentColor',
	style = {},
}) {
	return (
		<span
			className="ui-spinner"
			aria-hidden="true"
			style={{
				width: `${size}px`,
				height: `${size}px`,
				borderWidth: `${thickness}px`,
				color,
				...style,
			}}
		/>
	);
}
