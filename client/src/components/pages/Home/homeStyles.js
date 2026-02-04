import { colors, toRem } from "../../../styles/commonStyle";

export const homeStyle = {
	main: {
		padding: toRem(18),
	},
	trainingList: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(15),
	},
	trainingCard: {
		backgroundColor: colors.labelBG,
		borderRadius: toRem(10),
		padding: toRem(20) + ' ' + toRem(15),
		boxShadow: `0 2px 0 ${colors.green}`,
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(10),
		cursor: 'pointer',
	},
	trainingCardName: {
		fontSize: toRem(16),
		fontWeight: 'bold',
	},
	trainingCardDescription: {
		fontSize: toRem(16),
	},
	trainingCardAddButton: {
		marginTop: toRem(15),
	},

	trainingCardDetails: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(10),
	},
	dragDropeState: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	dragHandle: {
		fontSize: toRem(50),
		color: colors.blueLight,
	},
	trainingControls: {
		display: 'flex',
		gap: toRem(15),
	}
}