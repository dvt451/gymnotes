import React, { useContext, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import DateItem from './DateItem';
import DatePickerModal from './DatePickerModal';
import { useDateListLogic } from './dateListLogic';
import Header from '../../widgets/Header';
import { createDateListStyles } from './DateListStyles';
import { colors, createCommonStyle } from '../../../styles/commonStyle';
import DateListControls from './DateListControls';
import { GlobalContext } from '../../../context/GlobalContext';

export default function DateList() {
	const location = useLocation();
	const { trainingId } = useParams();
	const [editState, setEditState] = useState(false);
	const { trainingText, trainingTitle } = location.state || {};
	const {
		datesByTraining,
		showPicker,
		setShowPicker,
		selectedDate,
		setSelectedDate,
		addDate,
		deleteDate,
		openDayDetails,
		isLoading,
		error,
		updateDate
	} = useDateListLogic(trainingId, trainingText, trainingTitle);
	const { mainColor } = useContext(GlobalContext);
	const [addError, setAddError] = useState(null);
	const commonStyle = createCommonStyle(mainColor);

	// Обработчик добавления даты
	const handleAddDate = async () => {
		const formatted = selectedDate.toISOString().split('T')[0];
		try {
			await addDate(formatted);
			setShowPicker(false);   // закрываем при успехе
			setAddError(null);       // сбрасываем ошибку
		} catch (err) {
			setAddError(err.message); // показываем ошибку в модалке
		}
	};
	const dateListStyles = createDateListStyles(mainColor); // передаем основной цвет в стили
	// Обработчик закрытия модалки
	const handleClosePicker = () => {
		setShowPicker(false);
		setAddError(null); // очищаем ошибку при закрытии
	};
	if (!trainingId) {
		return <div style={dateListStyles.errorMessage}>Ошибка: не указан ID тренировки</div>;
	}

	const today = new Date().toISOString().split('T')[0];
	const currentDates = datesByTraining[trainingId] || [];
	const todayExists = currentDates.some(item => item.date === today);

	if (isLoading) {
		return (
			<div style={dateListStyles.loadingContainer}>
				<p style={dateListStyles.loadingText}>Загрузка дат...</p>
			</div>
		);
	}

	const handleToggleEdit = () => setEditState(!editState);

	return (
		<>
			<Header />
			<div style={dateListStyles.container}>
				<div style={{ ...dateListStyles.trainingHeader, ...commonStyle.titleHeader }}>
					{trainingText ? `${trainingText} — ` : ''}{trainingTitle}
					{currentDates.length > 0 && (
						<DateListControls
							editState={editState}
							onToggleEdit={handleToggleEdit}
						/>
					)}
				</div>
				<div style={dateListStyles.content}>
					<div style={dateListStyles.datesList}>
						{currentDates.length === 0 ? (
							<div style={dateListStyles.emptyState}>
								<p style={dateListStyles.emptyStateText}>Нет добавленных дат</p>
							</div>
						) : (
							[...currentDates]
								.sort((a, b) => new Date(b.date) - new Date(a.date))
								.map(item => (
									<DateItem
										key={item.id}
										item={item}
										today={today}
										onOpen={openDayDetails}
										onDelete={deleteDate}
										styles={dateListStyles}
										editState={editState}
										onUpdate={updateDate}
										error={error}
									/>
								))
						)}
					</div>

					<div style={dateListStyles.buttonContainer}>
						<button
							style={{
								...commonStyle.button,
								...(todayExists && {
									backgroundColor: colors.gray,
									opacity: 0.5,
									cursor: 'not-allowed',
								})
							}}
							disabled={todayExists}
							onClick={() => addDate(today)}
						>
							{todayExists ? 'Already added' : 'Add today'}
						</button>

						<button
							style={{ ...commonStyle.button, ...dateListStyles.pickerButton }}
							onClick={() => setShowPicker(true)}
						>
							Choose date
						</button>
					</div>
				</div>

				<DatePickerModal
					visible={showPicker}
					selectedDate={selectedDate}
					onSelect={setSelectedDate}
					onClose={handleClosePicker}          // ← обновлённый обработчик
					error={addError}                      // ← локальная ошибка
					onAdd={handleAddDate}                  // ← новый обработчик
					styles={dateListStyles}
				/>
			</div>
		</>
	);
}
