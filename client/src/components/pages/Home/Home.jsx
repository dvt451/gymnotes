import React, { useContext } from 'react'
import Header from '../../widgets/Header';
import { createHomeStyle } from './homeStyles';
import TrainingsSection from './TrainingSection/TrainingsSection';
import Footer from '../../widgets/Footer';
import Nutritions from './nutritions/Nutritions';
import { GlobalContext } from '../../../context/GlobalContext';

export default function Home() {
	const { mainColor } = useContext(GlobalContext);

	return (
		<>
			<Header />
			<main style={{
				...createHomeStyle(mainColor).main, ...{
					display: 'flex',
					flexDirection: 'column',
					gap: '20px',
					paddingBottom: '95px'
				}
			}}>
				<Nutritions />
				<TrainingsSection />
			</main >
			<Footer />
			{/* Модальное окно */}

		</>
	);
}