// DatePickerModalStyles.js
import { commonStyle, colors, toRem } from '../../../styles/commonStyle';

export const datePickerModalStyles = {
	// Оверлей модального окна
	overlay: {
		...commonStyle.popup,
	},

	layer: {
		...commonStyle.popupLayer,
	},

	// Контент модального окна
	content: {
		...commonStyle.popupContent,
		backgroundColor: colors.labelBG,
		border: `2px solid ${colors.blueLight}`,
		maxWidth: toRem(400),
		padding: toRem(20),
	},

	// Контейнер для календаря
	calendarContainer: {
		marginBottom: toRem(20),
	},

	// Стили для ReactDatePicker
	datePicker: {
		width: '100%',
		'& .react-datepicker': {
			backgroundColor: colors.labelBG,
			border: `1px solid ${colors.blueLight}`,
			borderRadius: toRem(10),
			fontFamily: 'inherit',
		},
		'& .react-datepicker__header': {
			backgroundColor: colors.blueDark,
			borderBottom: `1px solid ${colors.blueLight}`,
			paddingTop: toRem(10),
		},
		'& .react-datepicker__current-month': {
			color: colors.white,
			fontSize: toRem(16),
			fontWeight: 'bold',
		},
		'& .react-datepicker__day-name': {
			color: colors.blueLight,
		},
		'& .react-datepicker__day': {
			color: colors.white,
			'&:hover': {
				backgroundColor: colors.blueLight,
				color: colors.black,
			},
		},
		'& .react-datepicker__day--selected': {
			backgroundColor: colors.green,
			color: colors.black,
		},
		'& .react-datepicker__day--today': {
			backgroundColor: colors.orange,
			color: colors.black,
			fontWeight: 'bold',
		},
		'& .react-datepicker__month-dropdown, & .react-datepicker__year-dropdown': {
			backgroundColor: colors.labelBG,
			border: `1px solid ${colors.blueLight}`,
		},
		'& .react-datepicker__navigation': {
			top: toRem(10),
			'&:hover': {
				borderColor: colors.blueLight,
			},
		},
		'& .react-datepicker__navigation-icon::before': {
			borderColor: colors.blueLight,
		},
	},

	// Кнопки действий
	actions: {
		display: 'flex',
		justifyContent: 'space-between',
		gap: toRem(15),
	},

	// Кнопка подтверждения
	confirmButton: {
		...commonStyle.popupCreateButton,
		backgroundColor: colors.green,
		flex: 1,
		fontSize: toRem(16),
		fontWeight: 'bold',
	},

	// Кнопка отмены
	cancelButton: {
		...commonStyle.popupCancelButton,
		backgroundColor: colors.orange,
		flex: 1,
		fontSize: toRem(16),
		fontWeight: 'bold',
	},

	// Заголовок модального окна (опционально)
	header: {
		fontSize: toRem(20),
		fontWeight: 'bold',
		color: colors.white,
		marginBottom: toRem(20),
		textAlign: 'center',
		paddingBottom: toRem(10),
		borderBottom: `1px solid ${colors.blueLight}`,
	},
};