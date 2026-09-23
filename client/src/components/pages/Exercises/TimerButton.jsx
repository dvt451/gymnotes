import React, { useContext } from 'react'
import { LuTimerReset } from "react-icons/lu";
import { colors } from '../../../styles/commonStyle';
import { GlobalContext } from '../../../context/GlobalContext';

export default function TimerButton() {
	const { setTimerDisplayState } = useContext(GlobalContext);

	const timerOpener = {
		position: 'fixed',
		bottom: '82px',
		right: '20px',
		fontSize: '2rem',
		color: colors.green,
		cursor: 'pointer',
		border: `2px solid ${colors.green}`,
		borderRadius: '50%',
		backgroundColor: colors.labelBG,
		width: 50 + "px",
		height: 50 + 'px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	}
	return (
		<div style={timerOpener} onClick={() => setTimerDisplayState(true)}>
			<LuTimerReset />
		</div>
	)
}
