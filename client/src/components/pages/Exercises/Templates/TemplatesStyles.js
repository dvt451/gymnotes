// TemplatesStyles.js
import { colors, toRem } from '../../../../styles/commonStyle';

export const createTemplatesStyles = (mainColor) => ({
	// Основной контейнер
	container: {
		marginBottom: toRem(30),
		backgroundColor: 'rgba(24, 30, 35, 0.5)',
		borderRadius: toRem(12),
		padding: toRem(20),
		border: `1px solid ${colors.labelBG}`,
	},

	// Хедер шаблонов
	header: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: toRem(15),
	},

	// Заголовок шаблонов
	title: {
		fontSize: toRem(18),
		fontWeight: '600',
		color: colors.white,
		backgroundColor: 'transparent',
		border: 'none',
		cursor: 'pointer',
		padding: `${toRem(8)} ${toRem(12)}`,
		borderRadius: toRem(8),
		transition: 'all 0.3s ease',
		display: 'flex',
		alignItems: 'center',
		gap: toRem(10),
		width: '100%',
		'&:hover': {
			backgroundColor: 'rgba(0, 200, 255, 0.1)',
			transform: 'translateX(5px)',
		},
	},

	// Кнопка редактирования
	editButton: {
		backgroundColor: 'transparent',
		border: 'none',
		color: colors.white,
		fontSize: toRem(14),
		cursor: 'pointer',
		padding: `${toRem(6)} ${toRem(12)}`,
		borderRadius: toRem(6),
		opacity: 0.7,
		transition: 'all 0.3s ease',
		'&:hover': {
			opacity: 1,
			backgroundColor: 'rgba(255, 204, 0, 0.1)',
		},
	},

	editButtonEditing: {
		backgroundColor: colors.orange,
		color: colors.black,
		opacity: 1,
		fontWeight: 'bold',
		'&:hover': {
			backgroundColor: '#e6b800',
		},
	},

	// Блок со списком шаблонов
	templateListBlock: {
		marginTop: toRem(15),
		animation: 'fadeIn 0.3s ease',
	},

	// Список шаблонов
	templateList: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(10),
	},

	// Элемент шаблона
	templateItem: {
		backgroundColor: colors.labelBG,
		border: 'none',
		color: colors.white,
		padding: `${toRem(12)} ${toRem(16)}`,
		borderRadius: toRem(8),
		fontSize: toRem(16),
		textAlign: 'left',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		width: '100%',
		'&:hover': {
			backgroundColor: 'rgba(0, 200, 255, 0.1)',
			transform: 'translateX(5px)',
		},
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
		backgroundColor: mainColor || colors.green,
		border: 'none',
		color: colors.black,
		padding: `${toRem(12)} ${toRem(16)}`,
		borderRadius: toRem(8),
		fontSize: toRem(16),
		fontWeight: '600',
		cursor: 'pointer',
		marginTop: toRem(5),
		transition: 'all 0.3s ease',
		width: '100%',
		'&:hover': {
			backgroundColor: '#7ac22a',
			transform: 'translateY(-2px)',
		},
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
});