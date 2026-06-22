import React, { useContext } from 'react'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext';
import Home from './components/pages/Home/Home';
// import GlobalStyles from './styles/GlobalStyles';
// import './scss/style.scss';
import './styles/style.css';
import Login from './components/pages/Log/Login';
import Register from './components/pages/Log/Register';
import ForgotPassword from './components/pages/Log/ForgotPassword';
import ResetPassword from './components/pages/Log/ResetPassword';
import DateList from './components/pages/DateList/DateList';
import Exercises from './components/pages/Exercises/Exercises';
import Profile from './components/pages/profile/Profile';
import { GlobalProvider } from './context/GlobalContext';
import ExerciseLibrary from './components/pages/exerciseLibrary/ExerciseLibrary';
import Goals from './components/pages/Goals/Goals';
import Progress from './components/pages/Progress/Progress';
import AppLoadingScreen from './components/widgets/Loading/AppLoadingScreen';
import { AuthContext } from './context/AuthContext';

function AppRoutes() {
	const { isBootstrapping } = useContext(AuthContext);

	if (isBootstrapping) {
		return <AppLoadingScreen />;
	}

	return (
		<Routes>
			<Route element={<Login />} path='/' />
			<Route element={<Home />} path='/home' />
			<Route element={<Profile />} path='/profile' />
			<Route element={<Register />} path='/register' />
			<Route element={<ForgotPassword />} path='/forgot-password' />
			<Route element={<ResetPassword />} path='/reset-password/:token' />
			<Route element={<DateList />} path='/date-list/:trainingId' />
			<Route element={<Exercises />} path='/exercises/:trainingId/:date' />
			<Route element={<ExerciseLibrary />} path='/exercise-library' />
			<Route element={<Progress />} path='/progress' />
			<Route element={<Goals />} path='/goals' />
		</Routes>
	);
}

function App() {

	return (
		<div className="wrapper">
			{/* <GlobalStyles /> */}
			<div style={{
				maxWidth: '1200px',
				margin: '0 auto',
				height: '100%',
				width: '100%',
				display: 'flex',
				flexDirection: 'column',
			}}>
				<BrowserRouter>
					<GlobalProvider>
						<AuthProvider>
							<AppRoutes />
						</AuthProvider>
					</GlobalProvider>
				</BrowserRouter>
			</div>
		</div >
	);
}

export default App;
