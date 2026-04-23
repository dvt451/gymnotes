import React from 'react';
import InlineSpinner from './InlineSpinner';

export default function LoadingButton({
	children,
	isLoading = false,
	loadingLabel,
	spinnerColor,
	spinnerSize = 16,
	disabled,
	className = '',
	style = {},
	type = 'button',
	...rest
}) {
	return (
		<button
			type={type}
			className={className}
			style={style}
			disabled={disabled || isLoading}
			{...rest}
		>
			<span className="ui-loading-button">
				{isLoading && (
					<InlineSpinner
						size={spinnerSize}
						color={spinnerColor}
					/>
				)}
				<span>{isLoading ? (loadingLabel || children) : children}</span>
			</span>
		</button>
	);
}
