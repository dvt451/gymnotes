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
import ButtonType from '../../widgets/ButtonType';
import AppLoadingScreen from '../../widgets/Loading/AppLoadingScreen';

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
		updateDate,
		requestDeleteDate,
		deletePopupOpen,
		setDeletePopupOpen,
		dateToDelete // получаем ID даты для удаления
	} = useDateListLogic(trainingId, trainingText, trainingTitle);

	const { mainColor } = useContext(GlobalContext);
	const [addError, setAddError] = useState(null);
	const commonStyle = createCommonStyle(mainColor);

	const handleAddDate = async () => {
		const formatted = selectedDate.toISOString().split('T')[0];
		try {
			await addDate(formatted);
			setShowPicker(false);
			setAddError(null);
		} catch (err) {
			setAddError(err.message);
		}
	};

	const dateListStyles = createDateListStyles(mainColor);

	const handleClosePicker = () => {
		setShowPicker(false);
		setAddError(null);
	};

	const handleToggleEdit = () => setEditState(!editState);

	if (!trainingId) {
		return <div style={dateListStyles.errorMessage}>Ошибка: не указан ID тренировки</div>;
	}

	const today = new Date().toISOString().split('T')[0];
	const currentDates = datesByTraining[trainingId] || [];
	const todayExists = currentDates.some(item => item.date === today);

	if (isLoading) {
		return <AppLoadingScreen />;
	}

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
										key={item._id || item.id}
										item={item}
										today={today}
										onOpen={openDayDetails}
										deleteDate={() => deleteDate()} // Передаём функцию без параметров
										editState={editState}
										onUpdate={updateDate}
										error={error}
										requestDeleteDate={() => requestDeleteDate(item._id)} // Передаём замкнутую функцию с ID
										deletePopupOpen={deletePopupOpen} // Просто передаём состояние
										setDeletePopupOpen={setDeletePopupOpen}
									/>
								))
						)}
					</div>

					<div style={dateListStyles.buttonContainer}>
						<ButtonType
							addStyle={
								todayExists && {
									backgroundColor: colors.gray,
									opacity: 0.5,
									cursor: 'not-allowed',
								}
							}
							functionOnClick={() => addDate(today)}
						>
							{todayExists ? 'Already added' : 'Add today'}
						</ButtonType>

						<ButtonType
							addStyle={dateListStyles.pickerButton}
							functionOnClick={() => setShowPicker(true)}
							buttonType={4}
						>
							Choose date
						</ButtonType>
					</div>
				</div>

				<DatePickerModal
					visible={showPicker}
					selectedDate={selectedDate}
					onSelect={setSelectedDate}
					onClose={handleClosePicker}
					error={addError}
					onAdd={handleAddDate}
				/>
			</div>
		</>
	);
}