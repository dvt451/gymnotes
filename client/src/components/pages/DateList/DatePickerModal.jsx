import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { datePickerModalStyles } from './DatePickerModalStyles';
import { commonStyle } from '../../../styles/commonStyle';
import './styles/style.scss';

export default function DatePickerModal({
	visible,
	selectedDate,
	onSelect,
	onClose,
	onAdd,
	styles = datePickerModalStyles // добавляем параметр стилей
}) {
	if (!visible) return null;

	const handleDateChange = (date) => {
		onSelect(date);
	};

	const handleAddClick = () => {
		onAdd();
		onClose();
	};

	return (
		<div
			style={commonStyle.popup}
			onClick={onClose}
		>
			<div style={commonStyle.popup} onClick={onClose}>
				<div style={commonStyle.popupLayer}></div>
				<div style={commonStyle.popupContent} onClick={e => e.stopPropagation()}>
					<div style={commonStyle.popupContentLayer}></div>
					<div
						style={commonStyle.popupContentContainer}
						onClick={e => e.stopPropagation()}
					>
						{/* Заголовок (опционально) */}
						<div style={commonStyle.title}>
							Выберите дату
						</div>

						<div style={styles.calendarContainer}>
							<ReactDatePicker
								selected={selectedDate}
								onChange={handleDateChange}
								inline
								showMonthDropdown
								showYearDropdown
								dropdownMode="select"
								calendarClassName="custom-calendar"
								dateFormat="yyyy-MM-dd"
							// Можно передать стили через wrapperClassName или создать кастомный компонент
							/>
						</div>

						<div style={commonStyle.popupButtons}>
							<button
								style={{ ...commonStyle.button, ...commonStyle.popupDeleteButton }}
								onClick={onClose}
							>
								Отмена
							</button>
							<button
								style={{ ...commonStyle.button, ...commonStyle.popupCreateButton }}
								onClick={handleAddClick}
							>
								Добавить дату
							</button>
						</div>
					</div>
				</div>
			</div>

		</div>
	);
}