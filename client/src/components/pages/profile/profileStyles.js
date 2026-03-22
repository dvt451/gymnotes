import { colors, toRem } from "../../../styles/commonStyle";


export const createProfileStyles = (mainColor) => ({
	profileSection: {
		textAlign: 'center',
		marginBottom: '30px',
		paddingBottom: '20px',
		padding: '18px',
		paddingBottom: '95px'
	},
	editSection: {
		marginBottom: '25px',
	},
	inputGroup: {
		marginBottom: '20px',
	},
	label: {
		display: 'block',
		marginBottom: '8px',
		fontSize: '14px',
		color: '#555',
		fontWeight: '500',
	},
	input: {
		width: '100%',
		padding: '5px 10px',
		borderRadius: '5px',
		fontSize: '15px',
		boxSizing: 'border-box',
		transition: 'border-color 0.2s',
		color: '#fff',
		backgroundColor: colors.labelBG,
	},
	inputFocus: {
		borderColor: '#4a90e2',
		outline: 'none',
	},
	buttonGroup: {
		display: 'flex',
		gap: '10px',
		marginTop: '20px',
	},
	submitButton: {
		color: mainColor || colors.green,
	},
	saveButton: {
		flex: 1,
		padding: '12px',
		backgroundColor: '#4a90e2',
		color: 'white',
		border: 'none',
		borderRadius: '8px',
		fontSize: '15px',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'background-color 0.2s',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '8px',
	},
	saveButtonDisabled: {
		backgroundColor: '#ccc',
		cursor: 'not-allowed',
	},
	cancelButton: {
		flex: 1,
		padding: '12px',
		backgroundColor: '#f0f0f0',
		color: '#666',
		border: 'none',
		borderRadius: '8px',
		fontSize: '15px',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'background-color 0.2s',
	},
	infoSection: {
		marginBottom: '25px',
	},
	infoList: {
		display: 'flex',
		flexDirection: 'column',
		gap: '5px',
	},
	infoRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
	},
	infoLabel: {
		fontSize: '15px',
		color: '#fff',
		fontWeight: 'bold',
	},
	infoValue: {
		fontSize: '16px',
		color: '#fff',
		fontWeight: '600',
	},
	editButtonHover: {
		backgroundColor: '#4a90e2',
		color: 'white',
	},
	infoEditRow: {
		display: 'flex',
		gap: '10px',
		width: '100%',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	logoutButton: {
		width: '100%',
		padding: '12px',
		backgroundColor: '#ff6b6b',
		color: colors.black,
		border: 'none',
		borderRadius: '8px',
		fontSize: '15px',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'background-color 0.2s',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '8px',
	},
	logoutButtonHover: {
		backgroundColor: '#ff5252',
	},
	infoEditRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '8px',
		width: '100%',
	},

	submitButton: {
		backgroundColor: '#4CAF50',
		color: 'white',
		border: 'none',
		borderRadius: '4px',
		padding: '8px 12px',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},

	cancelButton: {
		backgroundColor: '#f44336',
		color: 'white',
		border: 'none',
		borderRadius: '4px',
		padding: '8px 12px',
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
	},

	editButton: {
		backgroundColor: 'transparent',
		border: 'none',
		cursor: 'pointer',
		padding: '5px',
	},
	checkBox: {
		width: toRem(34),
		height: toRem(18),
		borderRadius: toRem(30),
		borderColor: `#797979`,
		borderWidth: toRem(1),
		borderStyle: 'solid',
		backgroundColor: colors.white,
		display: 'flex',
		alignItems: 'center',
		transition: 'all 0.3s ease 0s',
		position: 'relative',
	},
	checkBoxDott: {
		display: 'block',
		width: toRem(14),
		height: toRem(14),
		borderRadius: '50%',
		backgroundColor: colors.blueDark,
		transition: 'all 0.3s ease 0s',
		position: 'absolute',
		top: toRem(1),
		left: toRem(1),
	},
	checkBoxChecked: {
		justifyContent: 'flex-end',
		borderColor: mainColor || colors.green,
		backgroundColor: colors.labelBG,
	},
	checkBoxDottChecked: {
		left: toRem(17),
		backgroundColor: mainColor || colors.green,
	},


	colorInput: {
		width: '50px',
		height: '30px',
		border: '2px solid #ddd',
		borderRadius: '6px',
		cursor: 'pointer',
		padding: '2px',
		backgroundColor: 'transparent',

		// Убираем стандартные стили для Webkit
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none',

		// Стили для Webkit браузеров (Chrome, Safari, Edge)
		'&::-webkit-color-swatch-wrapper': {
			padding: 0,
		},

		'&::-webkit-color-swatch': {
			border: 'none',
			borderRadius: '4px',
		},

		// Стили для Firefox
		'&::-moz-color-swatch': {
			border: 'none',
			borderRadius: '4px',
		},

		// Hover эффект
		'&:hover': {
			borderColor: '#ff8c00',
			transform: 'scale(1.05)',
			transition: 'all 0.2s',
		},

		// Focus эффект
		'&:focus': {
			outline: 'none',
			borderColor: '#ff8c00',
			boxShadow: '0 0 0 2px rgba(255, 140, 0, 0.3)',
		}
	},

	// Альтернативный большой color input
	colorInputLarge: {
		width: toRem(50),
		height: '40px',
		cursor: 'pointer',
		padding: '0',
		margin: '0',
		backgroundColor: 'transparent',
	},

	// Стили для отображения выбранного цвета
	colorPreview: {
		width: '30px',
		height: '30px',
		borderRadius: '6px',
		border: '2px solid #ddd',
		marginLeft: '10px',
	},

	// Стили для цветовой палитры
	colorPalette: {
		display: 'flex',
		gap: '8px',
		flexWrap: 'wrap',
		marginTop: '10px',
	},

	colorPaletteItem: {
		width: '30px',
		height: '30px',
		borderRadius: '6px',
		border: '2px solid transparent',
		cursor: 'pointer',
		transition: 'transform 0.2s, border-color 0.2s',

		'&:hover': {
			transform: 'scale(1.1)',
			borderColor: '#333',
		},

		'&.selected': {
			borderColor: '#ff8c00',
			boxShadow: '0 0 0 2px rgba(255, 140, 0, 0.3)',
		}
	},
});