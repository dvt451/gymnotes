import React, { useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaBullseye, FaChartLine, FaRegUser } from 'react-icons/fa';
import { GiMuscleUp } from 'react-icons/gi';
import { MdHomeFilled } from 'react-icons/md';
import { GlobalContext } from '../../context/GlobalContext';
import { style } from './burgerMenuStyle';

const menuItems = [
	{ path: '/home', label: 'Home', Icon: MdHomeFilled },
	{ path: '/progress', label: 'Progress', Icon: FaChartLine },
	{ path: '/exercise-library', label: 'Library', Icon: GiMuscleUp },
	{ path: '/goals', label: 'Goals', Icon: FaBullseye },
	{ path: '/profile', label: 'Profile', Icon: FaRegUser },
];

export default function BurgerMenu() {
	const location = useLocation();
	const { mainColor, showBurgerMenu, setShowBurgerMenu } = useContext(GlobalContext);
	const closeMenu = () => setShowBurgerMenu(false);

	useEffect(() => {
		if (!showBurgerMenu) return undefined;

		const previousBodyOverflow = document.body.style.overflow;
		const previousDocumentOverflow = document.documentElement.style.overflow;
		document.body.style.overflow = 'hidden';
		document.documentElement.style.overflow = 'hidden';

		return () => {
			document.body.style.overflow = previousBodyOverflow;
			document.documentElement.style.overflow = previousDocumentOverflow;
		};
	}, [showBurgerMenu]);

	return (
		<div
			aria-hidden={!showBurgerMenu}
			style={{
				...style.burgerMenu,
				transform: showBurgerMenu ? 'translateX(0)' : 'translateX(-100%)',
				visibility: showBurgerMenu ? 'visible' : 'hidden',
			}}
			onClick={closeMenu}
		>
			<nav
				aria-label="Main navigation"
				style={style.navigationPanel}
				onClick={(event) => event.stopPropagation()}
			>
				{menuItems.map(({ path, label, Icon }) => {
					const isActive = location.pathname === path;
					const activeColor = mainColor || '#92E33C';

					return (
						<Link
							key={path}
							to={path}
							aria-current={isActive ? 'page' : undefined}
							onClick={closeMenu}
							style={{
								...style.navigationLink,
								color: isActive ? activeColor : '#fff',
							}}
						>
							<Icon style={style.navigationIcon} />
							<span>{label}</span>
							{isActive && <span style={{ ...style.activeDot, backgroundColor: activeColor }} />}
						</Link>
					);
				})}
			</nav>
		</div>
	);
}
