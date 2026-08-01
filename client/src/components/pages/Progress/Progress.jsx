import React, { useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react';
import Header from '../../widgets/Header';
import Footer from '../../widgets/Footer';
import { AuthContext } from '../../../context/AuthContext';
import { GlobalContext } from '../../../context/GlobalContext';
import { createCommonStyle } from '../../../styles/commonStyle';
import { createProgressStyles } from './ProgressStyles';
import OverallProgressSection from './OverallProgressSection';
import MuscleGroupStatisticsSection from './MuscleGroupStatisticsSection';
import ExerciseStatisticsSection from './ExerciseStatisticsSection';
import Gradient from '../../widgets/Gradient';
import SectionSkeleton from '../../widgets/Loading/SectionSkeleton';
import DatePickerModal from '../DateList/DatePickerModal';


export default function Progress() {
	const { BASE_URL, getToken } = useContext(AuthContext);
	const { mainColor } = useContext(GlobalContext);
	const [progress, setProgress] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [datePickerVisible, setDatePickerVisible] = useState(false);
	const [datePickerMode, setDatePickerMode] = useState('start');
	const [selectedStartDate, setSelectedStartDate] = useState('');
	const [selectedEndDate, setSelectedEndDate] = useState('');
	const [appliedStartDate, setAppliedStartDate] = useState('');
	const [appliedEndDate, setAppliedEndDate] = useState('');
	const [pickerError, setPickerError] = useState('');
	const requestRef = useRef(0);

	const commonStyle = createCommonStyle(mainColor);
	const progressStyles = useMemo(() => createProgressStyles(mainColor), [mainColor]);

	const formatDateValue = (value) => {
		if (!value) return '';
		const date = value instanceof Date ? value : new Date(value);
		const year = date.getFullYear();
		const month = `${date.getMonth() + 1}`.padStart(2, '0');
		const day = `${date.getDate()}`.padStart(2, '0');
		return `${year}-${month}-${day}`;
	};

	const loadProgress = useCallback((startDate = appliedStartDate, endDate = appliedEndDate) => {
		const requestId = ++requestRef.current;
		let isCancelled = false;

		const runLoad = async () => {
			setIsLoading(true);
			setError('');

			try {
				const token = getToken?.();
				const params = new URLSearchParams();
				if (startDate) params.set('startDate', startDate);
				if (endDate) params.set('endDate', endDate);

				const response = await fetch(`${BASE_URL}/api/progress${params.toString() ? `?${params.toString()}` : ''}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error('Failed to load progress statistics');
				}

				const data = await response.json();
				if (!isCancelled && requestRef.current === requestId) {
					setProgress(data);
				}
			} catch (err) {
				if (!isCancelled && requestRef.current === requestId) {
					setError(err.message || 'Failed to load progress statistics');
				}
			} finally {
				if (!isCancelled && requestRef.current === requestId) {
					setIsLoading(false);
				}
			}
		};

		runLoad();

		return () => {
			isCancelled = true;
		};
	}, [BASE_URL, getToken, appliedStartDate, appliedEndDate]);

	useEffect(() => {
		return loadProgress();
	}, [loadProgress]);

	const openDatePicker = (mode) => {
		setDatePickerMode(mode);
		setPickerError('');
		setDatePickerVisible(true);
	};

	const handleDateSelect = (date) => {
		const normalizedDate = formatDateValue(date);
		if (datePickerMode === 'start') {
			if (selectedEndDate && normalizedDate && normalizedDate > selectedEndDate) {
				setPickerError('Start date cannot be after end date');
				return;
			}
			setSelectedStartDate(normalizedDate);
		} else {
			if (selectedStartDate && normalizedDate && normalizedDate < selectedStartDate) {
				setPickerError('End date cannot be before start date');
				return;
			}
			setSelectedEndDate(normalizedDate);
		}
	};

	const handlePickerAdd = () => {
		setDatePickerVisible(false);
		setPickerError('');
	};

	const handleApplyRange = () => {
		if (selectedStartDate && selectedEndDate && selectedStartDate > selectedEndDate) {
			setPickerError('Start date cannot be after end date');
			return;
		}
		setAppliedStartDate(selectedStartDate);
		setAppliedEndDate(selectedEndDate);
		loadProgress(selectedStartDate, selectedEndDate);
	};

	const handleResetRange = () => {
		setSelectedStartDate('');
		setSelectedEndDate('');
		setAppliedStartDate('');
		setAppliedEndDate('');
		setPickerError('');
		loadProgress('', '');
	};

	const period = progress?.period;
	const overall = progress?.overall;
	const muscleGroups = progress?.muscleGroups || [];
	const exercises = progress?.exercises || [];

	return (
		<>
			<Gradient />
			<div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
				<Header />
				<main style={progressStyles.main}>
					<section style={progressStyles.section}>
						<div style={{ ...progressStyles.card, marginBottom: '18px' }}>
							<div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
								<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
									<h2 style={{ ...commonStyle.title, margin: 0 }}>Analysis range</h2>
									<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
										<button
											type="button"
											style={{ ...commonStyle.button, padding: '8px 12px', borderRadius: '999px' }}
											onClick={() => openDatePicker('start')}
										>
											From: {selectedStartDate || appliedStartDate || 'All time'}
										</button>
										<button
											type="button"
											style={{ ...commonStyle.button, padding: '8px 12px', borderRadius: '999px' }}
											onClick={() => openDatePicker('end')}
										>
											To: {selectedEndDate || appliedEndDate || 'All time'}
										</button>
									</div>
								</div>
								<div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
									<button
										type="button"
										style={{ ...commonStyle.popupCreateButton, padding: '8px 14px' }}
										onClick={handleApplyRange}
									>
										Apply
									</button>
									<button
										type="button"
										style={{ ...commonStyle.popupCancelButton, padding: '8px 14px' }}
										onClick={handleResetRange}
									>
										Reset
									</button>
								</div>
								{pickerError && (
									<div style={{ color: '#d32f2f', fontSize: '14px' }}>{pickerError}</div>
								)}
							</div>
						</div>
						{isLoading ? (
							<>
								<div style={progressStyles.card}>
									<SectionSkeleton
										showHeader={false}
										lines={2}
										lineHeight={24}
										lineGap={12}
									/>
									<div
										style={{
											display: 'grid',
											gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
											gap: '18px',
											alignItems: 'start',
										}}
									>
										<div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
											<div
												className="ui-skeleton"
												style={{ width: '220px', height: '220px', borderRadius: '50%', alignSelf: 'center' }}
											></div>
											<SectionSkeleton
												showHeader={false}
												cards={4}
												cardHeight={16}
												cardGap={10}
											/>
										</div>
										<SectionSkeleton
											showHeader={false}
											cards={4}
											columns={2}
											cardHeight={92}
											cardGap={10}
										/>
									</div>
								</div>

								<div style={progressStyles.section}>
									<div style={{ ...progressStyles.exerciseGroupCard, ...progressStyles.titleHeader }}>
										<SectionSkeleton
											showHeader={false}
											lines={1}
											lineHeight={24}
										/>
									</div>
									<SectionSkeleton
										showHeader={false}
										cards={3}
										columns={3}
										cardHeight={170}
										cardGap={12}
									/>
								</div>

								<div style={progressStyles.section}>
									<div style={{ ...progressStyles.exerciseGroupCard, ...progressStyles.titleHeader }}>
										<SectionSkeleton
											showHeader={false}
											lines={1}
											lineHeight={24}
										/>
									</div>
									<SectionSkeleton
										showHeader={false}
										cards={3}
										cardHeight={132}
										cardGap={12}
									/>
								</div>
							</>
						) : error ? (
							<div style={progressStyles.statusCard}>
								<p style={progressStyles.statusText}>{error}</p>
							</div>
						) : !period?.trackedExercises ? (
							<div style={progressStyles.statusCard}>
								<p style={progressStyles.statusText}>
									Add training days with weights to see your progress statistics.
								</p>
							</div>
						) : (
							<>
								<OverallProgressSection
									overall={overall}
									period={period}
									progressStyles={progressStyles}
									muscleGroups={muscleGroups}
								/>
								<MuscleGroupStatisticsSection
									commonStyle={commonStyle}
									muscleGroups={muscleGroups}
									progressStyles={progressStyles}
								/>
								<ExerciseStatisticsSection
									commonStyle={commonStyle}
									exercises={exercises}
									progressStyles={progressStyles}
								/>
							</>
						)}
						<DatePickerModal
							visible={datePickerVisible}
							selectedDate={
								datePickerMode === 'start'
									? (selectedStartDate ? new Date(`${selectedStartDate}T00:00:00`) : null)
									: (selectedEndDate ? new Date(`${selectedEndDate}T00:00:00`) : null)
							}
							onSelect={handleDateSelect}
							onClose={() => {
								setDatePickerVisible(false);
								setPickerError('');
							}}
							onAdd={handlePickerAdd}
							error={pickerError}
							title={datePickerMode === 'start' ? 'Select start date' : 'Select end date'}
							buttonText="Select"
						/>
					</section>
				</main >
				<Footer />
			</div >
		</>
	);
}
