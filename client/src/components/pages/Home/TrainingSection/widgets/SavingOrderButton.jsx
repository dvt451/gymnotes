import React, { useContext } from 'react'
import { GlobalContext } from '../../../../../context/GlobalContext';
import { createHomeStyle } from '../../homeStyles';
import { colors, createCommonStyle } from '../../../../../styles/commonStyle';
import LoadingButton from '../../../../widgets/LoadingButton';


export default function SavingOrderButton({ editState, state, handleSaveReorder }) {
	const { mainColor } = useContext(GlobalContext);
	const homeStyle = createHomeStyle(mainColor);
	const commonStyle = createCommonStyle(mainColor);

	return (
		editState && state.isReordering && (
			<LoadingButton
				onClick={handleSaveReorder}
				disabled={state.isLoading}
				isLoading={state.isLoading}
				loadingLabel="Saving order..."
				spinnerColor={colors.blueDark}
				style={{
					...commonStyle.button,
					...homeStyle.trainingCardAddButton,
					opacity: state.isLoading ? 0.7 : 1,
				}}
			>
				Save Order
			</LoadingButton>
		)
	)
}
