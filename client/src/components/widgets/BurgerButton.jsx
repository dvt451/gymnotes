import React, { useContext } from 'react'
import { style } from './burgerMenuStyle'
import { GlobalContext } from '../../context/GlobalContext';
export default function BurgerButton() {
	const { showBurgerMenu, setShowBurgerMenu } = useContext(GlobalContext);

	return (
		<div style={style.burgerButton} onClick={() => setShowBurgerMenu(!showBurgerMenu)}>
			<span style={style.burgerButtonLine}></span>
			<span style={style.burgerButtonLine}></span>
			<span style={style.burgerButtonLine}></span>
		</div>
	)
}
