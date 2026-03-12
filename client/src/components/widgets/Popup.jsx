import React, { useContext } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import { createCommonStyle } from '../../styles/commonStyle';
import { createPopupStyle } from './popupStyle';

export default function Popup({
	isOpen,
	onClose,
	children,
}) {
	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);
	const popupStyle = createPopupStyle(mainColor);
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
