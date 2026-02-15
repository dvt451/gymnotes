import React, { useContext } from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { createCommonStyle } from '../../../styles/commonStyle';
import './styles/style.scss';
import { GlobalContext } from '../../../context/GlobalContext';

export default function DatePickerModal({
	visible,
	selectedDate,
	onSelect,
	onClose,
	onAdd,
	error,
	title = "Выберите дату",
	buttonText = "Добавить"
}) {

	if (!visible) return null;
	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);
	const handleAddClick = (e) => {
		e.stopPropagation();
		onAdd();
	};
	return (
		<div style={commonStyle.popup} onClick={onClose}>
			<div style={commonStyle.popupLayer} />
			<div style={commonStyle.popupContent} onClick={(e) => e.stopPropagation()}>
				<div style={commonStyle.popupContentLayer} />
				<div style={commonStyle.popupContentContainer}>
					<div style={commonStyle.title}>{title}</div>

					{/* Яркий блок ошибки (inline-стили для гарантии) */}
					{error && (
						<div style={{
							color: '#d32f2f',
							backgroundColor: '#ffebee',
							padding: '10px 15px',
							borderRadius: '6px',
							marginBottom: '15px',
							textAlign: 'center',
							border: '1px solid #ef9a9a',
							fontWeight: '500',
							fontSize: '14px'
						}}>
							{error}
						</div>
					)}

					<div style={{ marginBottom: '20px' }}>
						<ReactDatePicker
							selected={selectedDate}
							onChange={onSelect}
							inline
							showMonthDropdown
							showYearDropdown
							dropdownMode="select"
							calendarClassName="custom-calendar"
							dateFormat="yyyy-MM-dd"
						/>
					</div>

					<div style={commonStyle.popupButtons}>
						<button
							style={{ ...commonStyle.button, ...commonStyle.popupCancelButton }}
							onClick={onClose}
						>
							Отмена
						</button>
						<button
							style={{ ...commonStyle.button, ...commonStyle.popupCreateButton }}
							onClick={handleAddClick}
						>
							{buttonText}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}