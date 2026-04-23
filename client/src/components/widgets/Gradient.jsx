import React from 'react'
import { useContext } from 'react';
import { GlobalContext } from '../../context/GlobalContext';
import { createCommonStyle } from '../../styles/commonStyle';

export default function Gradient() {
	const { mainColor } = useContext(GlobalContext);

	return (
		<div style={createCommonStyle(mainColor).gradient}></div>

	)
}
