import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createHomeStyle } from '../homeStyles';

function SortableTrainingCard({ item, editState, onEditClick, style }) {
	const {
		attributes,
		listeners,
		setNodeRef,
		transform,
		transition,
		isDragging,
	} = useSortable({ id: item._id });
	const { mainColor } = useContext(GlobalContext);
	const homeStyle = createHomeStyle(mainColor);
	const dragStyle = {
		transform: CSS.Transform.toString(transform),
		transition,
		opacity: isDragging ? 0.5 : 1,
		cursor: isDragging ? 'grabbing' : 'grab',
		position: 'relative',
		zIndex: isDragging ? 1000 : 1,
		...style,
	};

	return (
		<div
			ref={setNodeRef}
			style={dragStyle}
			{...attributes}
			{...listeners}
		>
			<div style={{ ...homeStyle.trainingCard, ...homeStyle.dragDropeState }}>
				<div style={homeStyle.trainingCardDetails}>
					<h3 style={homeStyle.trainingCardName}>{item.name}</h3>
					<p style={homeStyle.trainingCardDescription}>{item.text}</p>
					{editState && (
						<div style={homeStyle.editBadge}>
							✏️ Drag and drop cards to change the order
						</div>
					)}
				</div>
				<div style={homeStyle.dragHandle}>
					⋮⋮
				</div>
			</div>
		</div>
	);
}

export default SortableTrainingCard;