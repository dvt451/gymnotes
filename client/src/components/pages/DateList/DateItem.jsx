import React, { useContext, useState } from 'react';
import { dateItemStyles } from './DateItemStyles';
import DatePickerModal from './DatePickerModal';
import { colors, createCommonStyle, toRem } from '../../../styles/commonStyle';
import { FaTrash } from "react-icons/fa";
import { GlobalContext } from '../../../context/GlobalContext';
import Popup from '../../widgets/Popup';
import ButtonType from '../../widgets/ButtonType';

export default function DateItem({
	item, today, onOpen, deleteDate, onUpdate, editState, requestDeleteDate,
	deletePopupOpen, setDeletePopupOpen
}) {
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
			setShowEditPicker(false);
			setLocalError(null);
		} catch (err) {
			setLocalError(err.message);
		}
	};

	const handleCloseEditPicker = () => {
		setShowEditPicker(false);
		setLocalError(null);
	};

	const exerciseCount = Number(item.exerciseCount ?? item.exercises?.length ?? 0);

	const handleDeleteClick = (e) => {
		e.stopPropagation();
		console.log('Delete clicked for date:', item._id); // Для отладки
		requestDeleteDate(); // Вызываем функцию без передачи ID, так как она уже замкнута на item._id в родителе
	};

	const handleClosePopup = () => {
		setDeletePopupOpen(false);
	};

	const handleConfirmDelete = async () => {
		console.log('Confirming delete'); // Для отладки
		await deleteDate();
	};

	return (
		<>
			<div
				style={{
					display: 'flex',
					borderRadius: toRem(10),
					overflow: 'hidden',
				}}
			>
				<button
					style={{
						...commonStyle.label,
						borderRadius: toRem(0),
						...(isToday && dateItemStyles.todayHighlight)
					}}
					onClick={() => !editState ? onOpen(item.date) : handleEdit()}
				>
					<span style={{
						...dateItemStyles.dateText,
						...(isToday && dateItemStyles.todayText)
					}}>
						{item.date}
					</span>

					{editState && (
						<div style={{ ...commonStyle.EditButton, marginInline: '10px' }}>
							<img src="/img/icons/editorange.png" alt="Edit" style={commonStyle.EditIcon} />
						</div>
					)}
					{isToday && <span style={dateItemStyles.todayBadge}>Today</span>}
					{exerciseCount > 0 && (
						<span style={{ ...dateItemStyles.exercisesCount, ...(isToday && { color: colors.white, fontWeight: '700' }) }}>
							{exerciseCount} ex.
						</span>
					)}
				</button>

				{editState && (
					<button
						style={dateItemStyles.deleteButton}
						onClick={handleDeleteClick}
					>
						<FaTrash style={dateItemStyles.deleteIcon} />
					</button>
				)}
			</div>

			<DatePickerModal
				visible={showEditPicker}
				selectedDate={selectedDate}
				onSelect={setSelectedDate}
				onClose={handleCloseEditPicker}
				onAdd={handleUpdate}
				error={localError}
				title="Изменить дату"
				buttonText="Сохранить"
			/>

			{/* Всегда рендерим попап, но показываем только когда deletePopupOpen === true */}
			<Popup isOpen={deletePopupOpen} onClose={handleClosePopup}>
				<div style={{ textAlign: 'center' }}>
					<h3 style={{ ...commonStyle.titleHeader, color: '#fff' }}>Удалить дату?</h3>
					<p style={{ color: colors.blueLight }}>Вы уверены, что хотите удалить эту тренировку?</p>

					<div style={{ display: 'flex', gap: '10px', flexDirection: 'column', justifyContent: 'center', marginTop: '20px' }}>
						<ButtonType buttonType={9} functionOnClick={handleConfirmDelete}>
							удалить
						</ButtonType>

						<ButtonType buttonType={5} functionOnClick={handleClosePopup}>
							Отмена
						</ButtonType>
					</div>
				</div>
			</Popup>
		</>
	);
}