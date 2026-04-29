import React, { useContext, useEffect, useMemo, useState } from 'react';
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


export default function Progress() {
	const { BASE_URL, getToken } = useContext(AuthContext);
	const { mainColor } = useContext(GlobalContext);
	const [progress, setProgress] = useState(null);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');

	const commonStyle = createCommonStyle(mainColor);
	const progressStyles = useMemo(() => createProgressStyles(mainColor), [mainColor]);

	useEffect(() => {
		let isMounted = true;

		const loadProgress = async () => {
			setIsLoading(true);
			setError('');

			try {
				const token = getToken?.();
				const response = await fetch(`${BASE_URL}/api/progress`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) {
					throw new Error('Failed to load progress statistics');
				}

				const data = await response.json();
				if (isMounted) {
					setProgress(data);
				}
			} catch (err) {
				if (isMounted) {
					setError(err.message || 'Failed to load progress statistics');
				}
			} finally {
				if (isMounted) {
					setIsLoading(false);
				}
			}
		};

		loadProgress();

		return () => {
			isMounted = false;
		};
	}, [BASE_URL, getToken]);

	const period = progress?.period;
	const overall = progress?.overall;
	const muscleGroups = progress?.muscleGroups || [];
	const exercises = progress?.exercises || [];
	console.log(progress);

	return (
		<>
			<Gradient />
			<div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
				<Header />
				<main style={progressStyles.main}>
					<section style={progressStyles.section}>
						{isLoading ? (
							<div style={progressStyles.statusCard}>
								<p style={progressStyles.statusText}>Loading progress statistics...</p>
							</div>
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
					</section>
				</main >
				<Footer />
			</div >
		</>
	);
}
