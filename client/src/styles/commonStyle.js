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
	popupBG: '#3A393D',
	popupBorderColor: '#4E4D51'
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
	exerciseEditButton: {
		position: 'fixed',
		right: toRem(20),
		bottom: toRem(120),
		zIndex: 1000,
		borderRadius: '50%',
		border: '2px solid ' + colors.orange,
		width: toRem(50),
		height: toRem(50),
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.blueDark,
		bacdropFilter: 'blur(4px)',
		opacity: 0.9,
	},
	exerciseEditButtonEditing: {
		backgroundColor: colors.orange,
		opacity: 1,
	},
	EditButtonText: {
		fontSize: toRem(20),
		opacity: .25,
		fontWeight: 'bold',
	},
	button: {
		width: '100%',
		borderRadius: toRem(10),
		fontWeight: 'bold',
		textAlign: 'center',
		cursor: 'pointer',
		border: 'none',
	},

	label: {
		display: 'flex',
		width: '100%',
		alignItems: 'center',
		backgroundColor: colors.labelBG,
		borderRadius: toRem(12),
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		overflow: 'hidden',
		padding: toRem(20) + ' ' + toRem(15),
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