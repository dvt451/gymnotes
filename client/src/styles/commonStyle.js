// styles/commonStyle.js

export const colors = {
	blueDark: '#0C0E14',
	blueLight: '#00C8FF',
	labelBG: '#181E23',
	green: '#92E33C', // Значение по умолчанию
	orange: '#FFCC00',
	red: '#E33C3F',
	gray: "#4d4d4d",
	white: '#FFFFFF',
	black: '#000000',
	inputBorder: '#BFBFBF',
};

export const toRem = (value) => {
	return `${value / 16}rem`;
};

// Функция для создания стилей с динамическим цветом
export const createCommonStyle = (mainColor) => ({
	titleHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: toRem(15),
	},
	title: {
		fontSize: toRem(20),
		fontWeight: 'bold',
	},
	EditButton: {
		display: 'flex',
		alignItems: 'center',
		gap: toRem(10),
	},
	EditButtonText: {
		fontSize: toRem(20),
		opacity: .25,
		fontWeight: 'bold',
	},
	button: {
		width: '100%',
		padding: toRem(20),
		backgroundColor: mainColor || colors.green,
		borderRadius: toRem(10),
		fontWeight: 'bold',
		color: colors.black,
		textAlign: 'center',
		cursor: 'pointer',
		border: 'none',
		'&:hover': {
			opacity: 0.9,
		},
		'&:disabled': {
			opacity: 0.5,
			cursor: 'not-allowed',
		}
	},
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
		backgroundColor: colors.blueDark,
		opacity: 0.5,
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
		backgroundColor: colors.white,
		opacity: 0.9,
	},
	popupContentContainer: {
		position: 'relative',
		zIndex: 1,
		padding: toRem(30),
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(30),
	},
	popupContentInputs: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(10),
	},
	popupInput: {
		padding: toRem(5) + ' ' + toRem(10),
		borderRadius: toRem(5),
		border: `1px solid ${colors.inputBorder}`,
		backgroundColor: colors.white,
		color: colors.black,
		fontSize: toRem(16),
		'&:focus': {
			outline: 'none',
			borderColor: mainColor || colors.green,
		}
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