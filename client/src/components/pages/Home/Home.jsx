import React from 'react'
import Header from '../../widgets/Header';
import { homeStyle } from './homeStyles';
import TrainingsSection from './TrainingSection/TrainingsSection';
import Profile from '../profile/Profile';
import Footer from '../../widgets/Footer';

export default function Home() {


	return (
		<>
			<Header />
			<main style={homeStyle.main}>
				<TrainingsSection />
			</main >
			<Footer />
			{/* Модальное окно */}

		</>
	);
}