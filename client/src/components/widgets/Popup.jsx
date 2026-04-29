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

	}, [isOpen]);

	if (!isOpen) return null;

	const handleClose = (event) => {
		if (typeof onClose === 'function') onClose(event);
	};

	return (
		<div style={popupStyle.popup} className="popup" onClick={handleClose}>
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
