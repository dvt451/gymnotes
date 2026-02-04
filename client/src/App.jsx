import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext';
import Home from './components/pages/Home/Home';
// import GlobalStyles from './styles/GlobalStyles';
// import './scss/style.scss';
import './styles/style.css';
import Login from './components/pages/Log/Login';
import Register from './components/pages/Log/Register';
import DateList from './components/pages/DateList/DateList';
import Exercises from './components/pages/Exercises/Exercises';
import Profile from './components/pages/profile/Profile';

function App() {
	return (

		<div className="wrapper" style={{
		}}>
			{/* <GlobalStyles /> */}
			<BrowserRouter>
				<AuthProvider>
					<Routes>
						<Route element={<Login />} path='/' />
						<Route element={<Home />} path='/home' />
						<Route element={<Profile />} path='/profile' />
						<Route element={<Register />} path='/register' />
						<Route element={<DateList />} path='/date-list/:trainingId' />
						<Route element={<Exercises />} path='/exercises/:trainingId/:date' />
					</Routes>
				</AuthProvider>
			</BrowserRouter>
		</div >
	);
}

export default App;