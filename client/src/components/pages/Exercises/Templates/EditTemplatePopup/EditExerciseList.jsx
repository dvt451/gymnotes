import React, { useContext, useState } from 'react'
import { FaArrowUp, FaTrash, FaArrowDown, FaPencilAlt, FaPen } from 'react-icons/fa'
import { createPopupStyle } from '../../../../widgets/popupStyle';
import { colors, createCommonStyle } from '../../../../../styles/commonStyle';
import { GlobalContext } from '../../../../../context/GlobalContext';
import EditExerciseListMove from './EditExerciseListMove';
import EditExerciseTrash from './EditExerciseTrash';
import { createTemplatesStyles } from '../TemplatesStyles';

export default function EditExerciseList({
	editingExercises,
	removeExerciseFromEditing,
	moveExerciseInEditingList,
}) {
	const { mainColor } = useContext(GlobalContext);
	const popupStyle = createPopupStyle(mainColor);
	const templatesStyles = createTemplatesStyles(mainColor);
	const [reordrer, setReordrer] = useState(false)
	return (
		<div style={popupStyle.popupLibraryBlock}>
			<div style={templatesStyles.header}>
				<h3 style={popupStyle.title}>List</h3>
				<button
					style={{
						...templatesStyles.editButton,
						...(reordrer && templatesStyles.editButtonEditing)
					}}
					onClick={() => setReordrer(!reordrer)}
				>
					{reordrer ? 'Reorder...' : 'Reorder'}
					<FaPen style={{ marginLeft: '5px' }} />
				</button>
			</div>
			<div style={popupStyle.libraryList}>
				{editingExercises.map((ex, i) => (
					<div
						key={`${ex}_${i}`}
						style={popupStyle.ListItems}
					>
						<span style={popupStyle.ListItem}>{ex}</span>
						{
							reordrer ?
								<EditExerciseListMove
									i={i}
									moveExerciseInEditingList={moveExerciseInEditingList}
									editingExercises={editingExercises}
								/>
								:
								<EditExerciseTrash
									exercise={ex}
									removeExerciseFromEditing={removeExerciseFromEditing}
								/>
						}
					</div>
				))}
			</div>
		</div>
	)
}
