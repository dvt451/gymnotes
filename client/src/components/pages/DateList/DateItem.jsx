import React, { useContext, useState } from 'react';
import { dateItemStyles } from './DateItemStyles';
import DatePickerModal from './DatePickerModal';
import { colors, createCommonStyle } from '../../../styles/commonStyle';
import { FaTrash } from "react-icons/fa";
import { GlobalContext } from '../../../context/GlobalContext';

export default function DateItem({ item, today, onOpen, onDelete, onUpdate, editState }) {
	const isToday = item.date === today;
	const [showEditPicker, setShowEditPicker] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date(item.date));
	const [localError, setLocalError] = useState(null);

	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);

	const handleEdit = () => {
		setShowEditPicker(true);
		setLocalError(null);
	};

	const handleUpdate = async () => {
		const formatted = selectedDate.toISOString().split('T')[0];
		try {
			await onUpdate(item._id, formatted);
			setShowEditPicker(false);   // закрываем только при успехе
			setLocalError(null);
		} catch (err) {
			setLocalError(err.message); // показываем ошибку, модалка остаётся открытой
		}
	};
	const handleCloseEditPicker = () => {
		setShowEditPicker(false);
		setLocalError(null); // очищаем ошибку при закрытии
	};

	return (
		<>
			<div
				style={{
					...dateItemStyles.container,
					...(isToday && dateItemStyles.todayHighlight)
				}}
			>
				<button
					style={dateItemStyles.dateButton}
					onClick={() => !editState ? onOpen(item.date) : handleEdit()}
				>
					<span style={{
						...dateItemStyles.dateText,
						...(isToday && dateItemStyles.todayText)
					}}>
						{item.date}
					</span>

					{editState && (
						<div style={{ ...commonStyle.EditButton, marginRight: '10px' }}>
							<img src="/img/icons/editorange.png" alt="Edit" style={commonStyle.EditIcon} />
						</div>
					)}
					{isToday && <span style={dateItemStyles.todayBadge}>Today</span>}
				</button>

				{item.exercises?.length > 0 && (
					<span style={{ ...dateItemStyles.exercisesCount, ...(isToday && { color: colors.blueDark }) }}>
						{item.exercises.length} ex.
					</span>
				)}

				{editState && <button
					style={dateItemStyles.deleteButton}
					onClick={(e) => {
						e.stopPropagation();
						onDelete(item._id);
					}}
				>
					<FaTrash style={dateItemStyles.deleteIcon} />
				</button>}
			</div >

			<DatePickerModal
				visible={showEditPicker}
				selectedDate={selectedDate}
				onSelect={setSelectedDate}
				onClose={handleCloseEditPicker}   // важно для кнопки "Отмена"
				onAdd={handleUpdate}
				error={localError}                          // локальная ошибка для этой модалки
				title="Изменить дату"
				buttonText="Сохранить"
			/>
		</>
	);
}