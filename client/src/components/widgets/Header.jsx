import React, { useEffect, useContext, useState, } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Menu from './Menu';
import { headerStyle } from './headerStyle';

export default function Header() {
	const { user = {} } = useContext(AuthContext);
	const location = useLocation();
	const navigate = useNavigate();
	const [showBackButton, setShowBackButton] = useState(false);
	const [showUser, setShowUser] = useState(false);
	const theUser = user.user || {};

	useEffect(() => {
		// Проверяем, не находимся ли мы на странице /home
		setShowBackButton(!['/home', '/profile', '/progress'].includes(location.pathname));
	}, [location.pathname]);

	const handleGoBack = () => {
		navigate(-1); // Возврат на предыдущую страницу
	};

	return (
		<header style={headerStyle.header}>
			{/* Кнопка "Назад" */}
			{showBackButton && (
				<button
					onClick={handleGoBack}
					style={headerStyle.backButton}
					aria-label="Назад"
				>
					<i style={headerStyle.icon}>←</i>
				</button>
			)}

			{/* Аватар */}
			{<div style={headerStyle.user}>
				<Link to="/home" style={headerStyle.avatar}>
					<img
						style={headerStyle.avatarImage}
						src={'/user.png'}
						alt="User avatar"
					/>
				</Link>
				<div style={headerStyle.userInfo}>
					<h1 style={headerStyle.userName}>{theUser.name || 'Гость'}</h1>
					<p style={headerStyle.userWeight}>Weight - {theUser.weight ? `${theUser.weight}kg` : '—'}</p>
				</div>
			</div>}
		</header>
	);
}
