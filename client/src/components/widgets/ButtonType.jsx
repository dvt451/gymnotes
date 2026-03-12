import React, { useContext } from 'react'
import { colors, createCommonStyle, toRem } from '../../styles/commonStyle'
import { createHomeStyle } from '../pages/Home/homeStyles'
import { GlobalContext } from '../../context/GlobalContext';

export default function ButtonType({ children, functionOnClick, buttonType = 1, addStyle = [] }) {
	const { mainColor } = useContext(GlobalContext);
	const commonStyle = createCommonStyle(mainColor);
	const buttonStyles = [
		{
			backgroundColor: mainColor || colors.green,
			color: colors.black,
			padding: toRem(20),
		},
		{
			backgroundColor: mainColor || colors.green,
			color: colors.black,
			padding: toRem(10),
		},
		{
			backgroundColor: mainColor || colors.green,
			color: colors.white,
			padding: toRem(10),
		},
		{
			backgroundColor: colors.orange,
			color: colors.black,
			padding: toRem(20),
		},
		{
			backgroundColor: colors.orange,
			color: colors.black,
			padding: toRem(10),
		},
		{
			backgroundColor: colors.orange,
			color: colors.white,
			padding: toRem(10),
		},
		{
			backgroundColor: colors.blueLight,
			color: colors.white,
			padding: toRem(10),
		},
		{
			backgroundColor: colors.red,
			color: colors.black,
			padding: toRem(10),
		},
		{
			backgroundColor: colors.red,
			color: colors.white,
			padding: toRem(10),
		},
	];
	return (
		<button
			onClick={functionOnClick}
			style={{
				...commonStyle.button,
				...addStyle,
				...buttonStyles[buttonType - 1]
			}}>
			{children}
		</button>
	)
}
