// TemplatesStyles.js
import { colors, toRem } from '../../../../styles/commonStyle';

export const createTemplatesStyles = (mainColor) => ({
	// Основной контейнер
	container: {
		marginTop: toRem(10),
		marginBottom: toRem(30),
		borderRadius: toRem(12),
	},

	// Хедер шаблонов
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: toRem(5),
	},

	// Заголовок шаблонов
	title: {
		fontSize: toRem(18),
		fontWeight: '600',
		color: colors.white,
		backgroundColor: 'transparent',
		border: 'none',
		cursor: 'pointer',
		padding: toRem(8) + ' ' + toRem(12) + ' ' + toRem(8) + ' ' + toRem(0),
		borderRadius: toRem(8),
		transition: 'all 0.3s ease',
		display: 'flex',
		alignItems: 'center',
		gap: toRem(10),
		width: '100%',
	},

	// Кнопка редактирования
	editButton: {
		backgroundColor: 'transparent',
		border: 'none',
		color: colors.green,
		fontSize: toRem(14),
		cursor: 'pointer',
		padding: `${toRem(6)} ${toRem(12)}`,
		borderRadius: toRem(6),
		transition: 'all 0.3s ease',
		display: 'flex',
		alignItems: 'center',
		gap: toRem(5),
	},
	editButtonEditing: {
		backgroundColor: colors.green,
		color: colors.black,
		opacity: 1,
		fontWeight: 'bold',
	},

	// Блок со списком шаблонов
	templateListBlock: {
		animation: 'fadeIn 0.3s ease',
	},
	templateBody: {
		display: 'flex',
		gap: toRem(10),
	},

	// Список шаблонов
	templateList: {
		display: 'flex',
		alignItems: 'center',
		gap: toRem(10),
		overflowX: 'auto',
		width: '100%',
	},


	// Элемент шаблона
	templateItem: {
		backgroundColor: '#0E1317',
		border: '1px solid' + colors.gray,
		color: colors.white,
		padding: `${toRem(10)} ${toRem(14)}`,
		borderRadius: toRem(15),
		fontSize: toRem(14),
		textAlign: 'left',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		textAlign: 'center',
	},

	// Стиль для режима редактирования
	templateItemEditing: {
		backgroundColor: 'rgba(255, 204, 0, 0.1)',
		border: `1px dashed ${colors.orange}`,
		'&:hover': {
			backgroundColor: 'rgba(255, 204, 0, 0.2)',
		},
	},

	// Кнопка добавления шаблона
	templateAddButton: {
		backgroundColor: '#0E1317',
		border: 'none',
		color: colors.white,
		border: toRem(1) + ' solid' + colors.gray,
		padding: `${toRem(10)} ${toRem(16)}`,
		borderRadius: toRem(15),
		fontSize: toRem(16),
		fontWeight: 'bold',
		cursor: 'pointer',
		marginTop: toRem(5),
		transition: 'all 0.3s ease',
		whiteSpace: 'nowrap',
	},

	// Контент модального окна
	modalContent: {
		backgroundColor: colors.labelBG,
		border: `2px solid ${colors.blueLight}`,
		maxWidth: toRem(400),
	},

	modalContentLayer: {
		backgroundColor: colors.white,
		opacity: 0.95,
	},

	modalContentContainer: {
		backgroundColor: 'transparent',
	},

	modalTitle: {
		fontSize: toRem(20),
		fontWeight: 'bold',
		color: colors.white,
		marginBottom: toRem(20),
		textAlign: 'center',
	},

	// Поля ввода
	borderStyle: {
		borderBottom: `1px solid ${colors.popupBorderColor}`,
	},

	addExerciseButton: {
		backgroundColor: colors.blueLight,
		border: 'none',
		color: colors.black,
		width: toRem(40),
		height: toRem(40),
		borderRadius: toRem(8),
		fontSize: toRem(18),
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		transition: 'all 0.3s ease',
		'&:hover': {
			backgroundColor: '#00b8e6',
			transform: 'scale(1.1)',
		},
	},

	exerciseName: {
		color: colors.black,
		fontSize: toRem(14),
		fontWeight: '500',
	},

	// ========== КНОПКИ МОДАЛЬНЫХ ОКОН ==========

	// Контейнер для кнопок (горизонтальный)
	modalButtonsHorizontal: {
		display: 'flex',
		justifyContent: 'space-between',
		gap: toRem(10),
		marginTop: toRem(20),
	},

	// Кнопка сохранения
	saveButton: {
		backgroundColor: mainColor || colors.green,
		flex: 1,
		fontSize: toRem(16),
		fontWeight: 'bold',
		transition: 'all 0.3s ease',
		'&:hover': {
			backgroundColor: '#7ac22a',
			transform: 'translateY(-2px)',
		},
	},

	// Кнопка отмены
	cancelButton: {
		backgroundColor: colors.orange,
		flex: 1,
		fontSize: toRem(16),
		fontWeight: 'bold',
		transition: 'all 0.3s ease',
		'&:hover': {
			backgroundColor: '#e6b800',
			transform: 'translateY(-2px)',
		},
	},

	// Кнопка удаления
	deleteButton: {
		backgroundColor: colors.red,
		flex: 1,
		fontSize: toRem(16),
		fontWeight: 'bold',
		transition: 'all 0.3s ease',
		'&:hover': {
			backgroundColor: '#d32f2f',
			transform: 'translateY(-2px)',
		},
	},
	notification: {
		position: 'fixed',
		top: '80px',
		right: '20px',
		backgroundColor: '#4CAF50',
		color: 'white',
		padding: '15px 20px',
		borderRadius: '8px',
		boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
		zIndex: 9999,
		maxWidth: '400px',
		transition: 'transform 0.3s ease-in-out',
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
	},
	notificationError: {
		backgroundColor: '#f44336',
	},
	notificationIcon: {
		fontSize: '20px',
	},
	notificationMessage: {
		fontSize: '14px',
		fontWeight: '500',
	}
});