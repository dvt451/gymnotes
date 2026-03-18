import { tr } from 'date-fns/locale';
import { colors, toRem } from '../../styles/commonStyle';

export const createPopupStyle = (mainColor) => ({
	popup: {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		zIndex: 1000,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
	},
	popupLayer: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: colors.black,
		opacity: 0.9,
	},
	popupContent: {
		position: 'relative',
		zIndex: 1,
		color: colors.black,
		borderRadius: toRem(10),
		overflow: 'hidden',
		maxWidth: toRem(378),
		width: '100%',
	},
	popupContentLayer: {
		position: 'absolute',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		backgroundColor: colors.popupBG,
		border: `1px solid ${colors.black}`,
	},
	popupContentContainer: {
		position: 'relative',
		zIndex: 1,
		padding: toRem(30),
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(20),
		overflowY: 'auto',

		maxHeight: "90vh",

	},
	title: {
		color: colors.white,
	},
	popupContentInputs: {
		display: 'flex',
		gap: toRem(10),
	},
	popupLibraryBlock: {
		borderTop: `1px solid ${colors.popupBorderColor}`,
		paddingTop: toRem(20),
	},
	libraryItem: {
		textAlign: 'left',
		padding: toRem(8) + ' ' + toRem(15),
		fontWeight: 'bold',
		borderRadius: toRem(10),
		backgroundColor: '#79838B',
		color: colors.white,
	},
	libraryList: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(10),
		marginTop: toRem(20),
		maxHeight: toRem(170),
		overflowY: 'auto',
	},
	ListItemsWrapper: {
	},
	ListItems: {
		display: 'flex',
		borderRadius: toRem(10),
		overflow: 'hidden',
	},
	ListItem: {
		backgroundColor: '#181E23',
		width: '100%',
		textAlign: 'left',
		padding: toRem(8) + ' ' + toRem(15),
		fontWeight: 'bold',
		color: colors.white,
		display: 'block',
	},
	removeExerciseButton: {
		color: colors.white,
		backgroundColor: colors.red,
		padding: toRem(0) + ' ' + toRem(14),
	},
	popupBodyContent: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(20),
	},
	popupInput: {
		padding: toRem(5) + ' ' + toRem(10),
		borderRadius: toRem(5),
		border: `1px solid ${colors.inputBorder}`,
		backgroundColor: colors.white,
		color: colors.black,
		fontSize: toRem(16),
		flex: '1 1 auto',
		width: '100%',
	},
	popupCreateButton: {
		padding: toRem(10),
		backgroundColor: mainColor || colors.green,
		color: colors.white,
		border: 'none',
		borderRadius: toRem(5),
		cursor: 'pointer',
		fontWeight: 'bold',
		'&:hover': {
			opacity: 0.9,
		}
	},
	popupCancelButton: {
		padding: toRem(10),
		backgroundColor: colors.orange,
		color: colors.black,
		border: 'none',
		borderRadius: toRem(5),
		cursor: 'pointer',
		fontWeight: 'bold',
		'&:hover': {
			opacity: 0.9,
		}
	},
	popupDeleteButton: {
		padding: toRem(10),
		backgroundColor: colors.red,
		color: colors.white,
		border: 'none',
		borderRadius: toRem(5),
		cursor: 'pointer',
		fontWeight: 'bold',
		'&:hover': {
			opacity: 0.9,
		}
	},
	popupButtons: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(15),
	},
});