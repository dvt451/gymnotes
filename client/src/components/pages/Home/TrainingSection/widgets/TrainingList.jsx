import React, { useContext } from 'react'
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { GlobalContext } from '../../../../../context/GlobalContext';
import { createHomeStyle } from '../../homeStyles';
import TrainingCard from './TrainingCard';
import SortableTrainingCard from './SortableTrainingCard';

export default function TrainingList({
	state,
	editState,
	setState,
	loadScene
}) {
	const { mainColor } = useContext(GlobalContext);
	const homeStyle = createHomeStyle(mainColor);
	const handleTrainingClick = (item) => {
		if (editState) {
			setState(prev => ({
				...prev,
				showEditPopup: true,
				selectedTraining: item,
				editName: item.name,
				editText: item.text || ''
			}));
		} else {
			loadScene(item);
		}
	};
	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (active.id !== over.id) {
			setState((prev) => {
				const oldIndex = prev.trainingDays.findIndex((t) => t._id === active.id);
				const newIndex = prev.trainingDays.findIndex((t) => t._id === over.id);

				const newOrder = arrayMove(prev.trainingDays, oldIndex, newIndex);

				// Сохраняем только в localStorage при перетаскивании
				saveOrderToLocalStorage(newOrder);

				return {
					...prev,
					trainingDays: newOrder,
				};
			});
		}
	};
	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);
	const saveOrderToLocalStorage = (trainings) => {
		const order = trainings.map(t => t._id);
		localStorage.setItem('trainingOrder', JSON.stringify(order));
	};
	return (
		state.trainingDays.length > 0 && (
			<>
				{state.isReordering ? (
					<DndContext
						sensors={sensors}
						collisionDetection={closestCenter}
						onDragEnd={handleDragEnd}
					>
						<SortableContext
							items={state.trainingDays.map(t => t._id)}
							strategy={verticalListSortingStrategy}
						>
							<div style={homeStyle.trainingList}>
								{state.trainingDays.map((item) => (
									<SortableTrainingCard
										key={item._id}
										item={item}
										editState={editState}
										onEditClick={handleTrainingClick}
									/>
								))}
							</div>
						</SortableContext>
					</DndContext>
				) : (
					<div style={homeStyle.trainingList}>
						{state.trainingDays.map(item => (
							<TrainingCard
								key={item._id}
								item={item}
								editState={editState}
								onClick={handleTrainingClick}
							/>
						))}
					</div>
				)}
			</>
		)
	)
}
