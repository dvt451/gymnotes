import React, { useEffect, useContext, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Menu from './Menu';
import { headerStyle } from './headerStyle';

export default function Header() {
	const { user = {} } = useContext(AuthContext);
	const location = useLocation();
	const navigate = useNavigate();
	const [showBackButton, setShowBackButton] = useState(false);
	const [showUser, setShowUser] = useState(false);
	useEffect(() => {
		// Проверяем, не находимся ли мы на странице /home
		setShowBackButton(location.pathname !== '/home');
		setShowUser(location.pathname !== '/profile');
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
			{showUser && <div style={headerStyle.user}>
				<div style={headerStyle.avatar}>
					<img
						style={headerStyle.avatarImage}
						src={'/user.png'}
						alt="User avatar"
					/>
				</div>
				<div style={headerStyle.userInfo}>
					<h1 style={headerStyle.userName}>{user.name || 'Гость'}</h1>
					<p style={headerStyle.userWeight}>Weight - {user.weight ? `${user.weight}kg` : '—'}</p>
				</div>
			</div>}
		</header>
	);
}