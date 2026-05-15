import React, { useContext, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import DateItem from './DateItem';
import DatePickerModal from './DatePickerModal';
import { useDateListLogic } from './dateListLogic';
import Header from '../../widgets/Header';
import { createDateListStyles } from './DateListStyles';
import { colors, createCommonStyle } from '../../../styles/commonStyle';
import DateListControls from './DateListControls';
import { GlobalContext } from '../../../context/GlobalContext';
import ButtonType from '../../widgets/ButtonType';
import SectionSkeleton from '../../widgets/Loading/SectionSkeleton';

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
	} = useDateListLogic(trainingId, trainingText, trainingTitle);

	const { mainColor } = useContext(GlobalContext);
	const [addError, setAddError] = useState(null);
	const commonStyle = createCommonStyle(mainColor);
	const dateListStyles = createDateListStyles(mainColor);

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

	const handleClosePicker = () => {
		setShowPicker(false);
		setAddError(null);
	};

	const handleToggleEdit = () => setEditState(!editState);

	if (!trainingId) {
		return <div style={dateListStyles.errorMessage}>Error: training ID is missing</div>;
	}

	const today = new Date().toISOString().split('T')[0];
	const currentDates = datesByTraining[trainingId] || [];
	const todayExists = currentDates.some((item) => item.date === today);
	const hasLoadedDates = Object.prototype.hasOwnProperty.call(datesByTraining, trainingId);
	const isInitialLoading = isLoading && !hasLoadedDates;

	return (
		<>
			<Header />
			<div style={dateListStyles.container}>
				{isInitialLoading ? (
					<>
						<div style={{ ...dateListStyles.trainingHeader, ...commonStyle.titleHeader }}>
							<div className="ui-skeleton" style={{ width: '54%', height: '32px', margin: '0 auto' }}></div>
						</div>
						<div style={dateListStyles.content}>
							<SectionSkeleton
								showHeader={false}
								cards={5}
								cardHeight={76}
								cardGap={15}
								style={dateListStyles.datesList}
							/>
							<div style={dateListStyles.buttonContainer}>
								<div className="ui-skeleton" style={{ height: '56px', borderRadius: '14px' }}></div>
								<div className="ui-skeleton" style={{ height: '56px', borderRadius: '14px' }}></div>
							</div>
						</div>
					</>
				) : (
					<>
						<div style={{ ...dateListStyles.trainingHeader, ...commonStyle.titleHeader }}>
							{trainingText ? `${trainingText} - ` : ''}
							{trainingTitle}
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
										<p style={dateListStyles.emptyStateText}>No dates added yet</p>
									</div>
								) : (
									[...currentDates]
										.sort((a, b) => new Date(b.date) - new Date(a.date))
										.map((item) => (
											<DateItem
												key={item._id || item.id}
												item={item}
												today={today}
												onOpen={openDayDetails}
												deleteDate={() => deleteDate()}
												editState={editState}
												onUpdate={updateDate}
												error={error}
												requestDeleteDate={() => requestDeleteDate(item._id)}
												deletePopupOpen={deletePopupOpen}
												setDeletePopupOpen={setDeletePopupOpen}
											/>
										))
								)}
							</div>

							<div style={dateListStyles.buttonContainer}>
								<ButtonType
									addStyle={
										todayExists
											? {
												backgroundColor: colors.gray,
												opacity: 0.5,
												cursor: 'not-allowed',
											}
											: undefined
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
					</>
				)}

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
