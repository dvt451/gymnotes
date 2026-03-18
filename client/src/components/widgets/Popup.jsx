import React, { useContext, useEffect } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import { createPopupStyle } from './popupStyle';

export default function Popup({
	isOpen,
	onClose,
	children,
}) {
	const { mainColor } = useContext(GlobalContext);
	const popupStyle = createPopupStyle(mainColor);

	useEffect(() => {
		if (!isOpen) return undefined;

		const previousBodyOverflow = document.body.style.overflow;
		const previousHtmlOverflow = document.documentElement.style.overflow;

		document.body.style.overflow = 'hidden';
		document.documentElement.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousBodyOverflow;
			document.documentElement.style.overflow = previousHtmlOverflow;
		};
	}, [isOpen]);

	if (!isOpen) return null;

	const handleClose = (event) => {
		if (typeof onClose === 'function') onClose(event);
	};

	return (
		<div style={popupStyle.popup} onClick={handleClose}>
			<div style={popupStyle.popupLayer}></div>
			<div
				style={popupStyle.popupContent}
				onClick={(event) => event.stopPropagation()}
			>
				<div style={popupStyle.popupContentLayer}></div>
				<div style={popupStyle.popupContentContainer}>
					{children}
				</div>
			</div>
		</div>
	);
}
