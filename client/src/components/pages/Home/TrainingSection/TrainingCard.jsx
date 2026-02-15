import React, { useContext } from 'react';
import { createHomeStyle } from '../homeStyles';
import { GlobalContext } from '../../../../context/GlobalContext';

function TrainingCard({ item, editState, onClick }) {
	const { mainColor } = useContext(GlobalContext);

	const homeStyle = createHomeStyle(mainColor);

	return (
		<div
			onClick={() => onClick(item)}
			style={{
				...homeStyle.trainingCard,
				...(editState && homeStyle.trainingCardEditMode)
			}}
		>
			<h3 style={homeStyle.trainingCardName}>{item.name}</h3>
			<p style={homeStyle.trainingCardDescription}>{item.text}</p>
			{editState && (
				<div style={homeStyle.editBadge}>
					✏️ Click to edit
				</div>
			)}
		</div>
	);
}

export default TrainingCard;