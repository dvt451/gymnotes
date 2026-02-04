// DateListStyles.js
import { commonStyle, colors, toRem } from '../../../styles/commonStyle';

export const dateListStyles = {
	// Основной контейнер
	container: {
		padding: toRem(18),
	},

	// Хедер с заголовком тренировки
	trainingHeader: {
		...commonStyle.titleHeader,
		fontSize: toRem(24),
		fontWeight: 'bold',
		color: colors.white,
		marginBottom: toRem(30),
		paddingBottom: toRem(20),
		borderBottom: `2px solid ${colors.blueLight}`,
		textAlign: 'center',

	},

	// Контейнер для контента
	content: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(30),
	},

	// Список дат
	datesList: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(15),
		maxHeight: 'calc(100vh - 250px)',
		overflowY: 'auto',
		paddingRight: toRem(10),
	},

	// Карточка даты
	dateItem: {
		backgroundColor: colors.labelBG,
		borderRadius: toRem(12),
		padding: toRem(20),
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		border: `2px solid transparent`,
		'&:hover': {
			borderColor: colors.blueLight,
			transform: 'translateY(-2px)',
			boxShadow: `0 4px 12px rgba(0, 200, 255, 0.2)`,
		},
	},

	// Стиль для сегодняшней даты
	dateItemToday: {
		backgroundColor: 'rgba(146, 227, 60, 0.1)',
		border: `2px solid ${colors.green}`,
	},

	// Контейнер с информацией о дате
	dateInfo: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(5),
		flex: 1,
	},

	// Дата
	dateText: {
		fontSize: toRem(18),
		fontWeight: 'bold',
		color: colors.white,
	},

	// Подпись "Сегодня"
	todayBadge: {
		fontSize: toRem(12),
		color: colors.green,
		fontWeight: 'bold',
		marginLeft: toRem(10),
		padding: `${toRem(2)} ${toRem(6)}`,
		backgroundColor: 'rgba(146, 227, 60, 0.1)',
		borderRadius: toRem(4),
	},

	// Количество упражнений
	exercisesCount: {
		fontSize: toRem(14),
		color: colors.blueLight,
		opacity: 0.8,
	},

	// Кнопки действий
	actionButtons: {
		display: 'flex',
		gap: toRem(10),
	},

	// Кнопка удаления
	deleteButton: {
		backgroundColor: 'transparent',
		border: 'none',
		color: colors.red,
		fontSize: toRem(18),
		cursor: 'pointer',
		padding: toRem(5),
		borderRadius: toRem(5),
		transition: 'all 0.3s ease',
		'&:hover': {
			backgroundColor: 'rgba(227, 60, 63, 0.1)',
			transform: 'scale(1.1)',
		},
	},

	// Контейнер для кнопок внизу
	buttonContainer: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(15),
		position: 'sticky',
		bottom: 0,
		backgroundColor: colors.blueDark,
		paddingTop: toRem(20),
		borderTop: `1px solid ${colors.labelBG}`,
	},

	// Кнопка "Добавить сегодня"
	todayButton: {
		...commonStyle.button,
	},

	// Кнопка выбора даты
	pickerButton: {
		...commonStyle.button,
		backgroundColor: colors.orange,
	},

	// Модальное окно выбора даты
	modalOverlay: {
		...commonStyle.popup,
	},

	modalLayer: {
		...commonStyle.popupLayer,
	},

	modalContent: {
		...commonStyle.popupContent,
		backgroundColor: colors.labelBG,
		border: `2px solid ${colors.blueLight}`,
	},

	modalHeader: {
		fontSize: toRem(20),
		fontWeight: 'bold',
		color: colors.white,
		marginBottom: toRem(20),
		textAlign: 'center',
	},

	modalButtons: {
		display: 'flex',
		justifyContent: 'space-between',
		gap: toRem(15),
		marginTop: toRem(30),
	},

	modalCancelButton: {
		...commonStyle.popupCancelButton,
		backgroundColor: colors.orange,
		flex: 1,
	},

	modalAddButton: {
		...commonStyle.popupCreateButton,
		backgroundColor: colors.green,
		flex: 1,
	},

	// Сообщение об ошибке
	errorMessage: {
		...commonStyle.center,
		color: colors.red,
		fontSize: toRem(18),
		fontWeight: 'bold',
		padding: toRem(50),
		textAlign: 'center',
	},

	// Пустое состояние
	emptyState: {
		...commonStyle.center,
		padding: toRem(50),
		textAlign: 'center',
	},

	emptyStateText: {
		color: colors.gray,
		fontSize: toRem(16),
		fontStyle: 'italic',
	},

	// Индикатор загрузки
	loadingContainer: {
		...commonStyle.center,
		padding: toRem(50),
	},

	loadingText: {
		color: colors.blueLight,
		fontSize: toRem(18),
	},
};

// Экспортируем также отдельные стили для использования в компонентах
export const DateItemStyles = {
	container: dateListStyles.dateItem,
	today: dateListStyles.dateItemToday,
	info: dateListStyles.dateInfo,
	date: dateListStyles.dateText,
	todayBadge: dateListStyles.todayBadge,
	exercisesCount: dateListStyles.exercisesCount,
	actions: dateListStyles.actionButtons,
	deleteButton: dateListStyles.deleteButton,
};

export const DatePickerModalStyles = {
	overlay: dateListStyles.modalOverlay,
	layer: dateListStyles.modalLayer,
	content: dateListStyles.modalContent,
	header: dateListStyles.modalHeader,
	buttons: dateListStyles.modalButtons,
	cancelButton: dateListStyles.modalCancelButton,
	addButton: dateListStyles.modalAddButton,
};