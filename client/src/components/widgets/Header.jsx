import React, { useEffect, useContext, useState, } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Menu from './Menu';
import PWAInstallButton from './PWAInstallButton';
import { headerStyle } from './headerStyle';
import { toRem } from '../../styles/commonStyle';
import BurgerButton from './BurgerButton';
import BurgerMenu from './BurgerMenu';
import { GlobalContext } from '../../context/GlobalContext';

export default function Header() {
	const { user = {} } = useContext(AuthContext);
	const { setShowBurgerMenu } = useContext(GlobalContext);
	const location = useLocation();
	const navigate = useNavigate();
	const [showBackButton, setShowBackButton] = useState(false);
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
			<PWAInstallButton />
			<BurgerMenu />
			<div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
				{/* Install Button */}
				<div style={{
					zIndex: 1001,
				}}>
					<div style={{
						display: 'flex',
						gap: toRem(30),
						alignItems: 'center',
						zIndex: 100,
					}}>
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
							<Link to="/home" style={headerStyle.avatar} onClick={() => setShowBurgerMenu(false)}>
								<img
									style={headerStyle.avatarImage}
									src={'/user.png'}
									alt="User avatar"
								/>
							</Link>
							<Link to="/profile" style={headerStyle.userInfo} onClick={() => setShowBurgerMenu(false)}>
								<h1 style={headerStyle.userName}>{theUser.name || 'Гость'}</h1>
								<p style={headerStyle.userWeight}>Weight - {theUser.weight ? `${theUser.weight}kg` : '—'}</p>
							</Link>
						</div>}
					</div>
				</div>
				<BurgerButton />
			</div>
		</header>
	);
}
