import React from 'react'
import Header from '../../widgets/Header';
import { homeStyle } from './homeStyles';
import TrainingsSection from './TrainingSection/TrainingsSection';
import Profile from '../profile/Profile';
import Footer from '../../widgets/Footer';
import Nutritions from './nutritions/Nutritions';

export default function Home() {


	return (
		<>
			<Header />
			<main style={homeStyle.main}>
				<Nutritions />
				<TrainingsSection />
			</main >
			<Footer />
			{/* Модальное окно */}

		</>
	);
}