import React, { useContext } from 'react'
import Header from '../../widgets/Header';
import { createHomeStyle } from './homeStyles';
import TrainingsSection from './TrainingSection/TrainingsSection';
import Footer from '../../widgets/Footer';
import Nutritions from './nutritions/Nutritions';
import { GlobalContext } from '../../../context/GlobalContext';
import { AuthContext } from '../../../context/AuthContext';
import Calendare from './CalendareSection/Calendare';
import Gradient from '../../widgets/Gradient';
import AppLoadingScreen from '../../widgets/Loading/AppLoadingScreen';

export default function Home() {
	const { mainColor } = useContext(GlobalContext);
	const { user } = useContext(AuthContext);
	const showScheduleSection = user?.user?.showScheduleSection !== false;
	const showNutritionSection = user?.user?.showNutritionSection !== false;
	return (
		<>
			<Gradient />
			<div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
				<Header />
				<main style={{
					...createHomeStyle(mainColor).main, ...{
						paddingBottom: '115px',
						display: 'flex',
						flexDirection: 'column',
						gap: '20px',
					}
				}}>
					{showScheduleSection && <Calendare />}
					{showNutritionSection && <Nutritions />}
					<TrainingsSection />
				</main >
				<Footer />
			</div>
			{/* Модальное окно */}
		</>
	);
}
