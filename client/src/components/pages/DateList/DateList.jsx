import React from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import DateItem from './DateItem';
import DatePickerModal from './DatePickerModal';
import { useDateListLogic } from './dateListLogic';
import Header from '../../widgets/Header';
import { dateListStyles } from './DateListStyles';
import { colors } from '../../../styles/commonStyle';

export default function DateList() {
	const location = useLocation();
	const { trainingId } = useParams();
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
		error
	} = useDateListLogic(trainingId, null, trainingText, trainingTitle);

	// Добавляем проверку на существование trainingId
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

	if (error) {
		return (
			<div style={dateListStyles.errorMessage}>
				<p>{error}</p>
			</div>
		);
	}

	return (
		<>
			<Header />
			<div style={dateListStyles.container}>
				<div style={dateListStyles.trainingHeader}>
					{trainingText ? `${trainingText} — ` : ''}{trainingTitle}
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
									/>
								))
						)}
					</div>

					<div style={dateListStyles.buttonContainer}>
						<button
							style={{
								...dateListStyles.todayButton,
								...(todayExists && {
									backgroundColor: colors.gray, opacity: 0.5,
									cursor: 'not-allowed',
								})
							}}
							disabled={todayExists}
							onClick={() => addDate(today)}
						>
							{todayExists ? 'Already added' : 'Add today'}
						</button>

						<button
							style={dateListStyles.pickerButton}
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
					onClose={() => setShowPicker(false)}
					onAdd={() => {
						const formatted = selectedDate.toISOString().split('T')[0];
						addDate(formatted);
						setShowPicker(false);
					}}
					styles={dateListStyles}
				/>
			</div >
		</>
	);
}