import React, { useContext } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import { createCommonStyle } from '../../styles/commonStyle';

export default function Popup({
	isOpen,
	onClose,
	children,
	layerStyle,
	contentStyle,
	contentLayerStyle,
	containerStyle,
}) {
	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);

	if (!isOpen) return null;

	const handleClose = (event) => {
		if (typeof onClose === 'function') onClose(event);
	};

	return (
		<div style={commonStyle.popup} onClick={handleClose}>
			<div style={layerStyle || commonStyle.popupLayer}></div>
			<div
				style={contentStyle || commonStyle.popupContent}
				onClick={(event) => event.stopPropagation()}
			>
				<div style={contentLayerStyle || commonStyle.popupContentLayer}></div>
				<div style={containerStyle || commonStyle.popupContentContainer}>{children}</div>
			</div>
		</div>
	);
}
