import { colors, toRem } from "../../../../styles/commonStyle";

export const nutritionsStyle = {
	nutritionsList: {
		display: 'flex',
		gap: toRem(10),
		overflowX: 'auto',
	},
	nutritionItem: {
		padding: toRem(15),
		backgroundColor: colors.labelBG,
		borderRadius: toRem(10),
		display: 'flex',
		flexDirection: 'column',
		justifyContent: 'center',
		gap: toRem(10),
	},
	nutritionItemHeader: {
		display: 'flex',
		alignItems: 'center',
		gap: toRem(10),
	},
	nutritionItemImg: {
		width: toRem(40),
		height: toRem(40),
	},
	nutritionItemNumber: {
		fontWeight: 'bold',
		fontSize: toRem(16),
	},
	nutritionItemText: {
		textAlign: 'center',
	},
	nutritionItemButton: {
		backgroundColor: colors.green,
		borderRadius: toRem(10),
		fontWeight: 'bold',
		fontSize: toRem(30),
		paddingBlock: toRem(5),
		paddingInline: toRem(25),
		color: colors.black,
	},
	nutritionItemButtonEdit: {
		backgroundColor: colors.red,
	}
}
