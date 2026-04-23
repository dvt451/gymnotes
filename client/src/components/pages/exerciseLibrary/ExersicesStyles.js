// ExercisesStyles.js
import { colors, toRem } from '../../../styles/commonStyle';

export const createExercisesStyles = (mainColor) => ({
	exercisesHeader: {
		justifyContent: 'center',
	},
	exerciseListBlock: {
		marginBottom: toRem(10),
	},
	exercisesListTitle: {
		marginBottom: toRem(20),
	},
	exercisesList: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(10),
	},
	muscleGroupsBlock: {
		borderRadius: toRem(14),
		padding: toRem(16),
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(14),
		marginBottom: toRem(20),
	},
	muscleGroupsHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: toRem(12),
	},
	muscleGroupsList: {
		display: 'grid',
		gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
		gap: toRem(10),
	},
	muscleGroupCard: {
		borderRadius: toRem(12),
		backgroundColor: 'rgba(255, 255, 255, 0.04)',
		padding: toRem(12),
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(6),
	},
	muscleGroupCardHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: toRem(8),
	},
	muscleGroupCardTitle: {
		color: colors.white,
		fontSize: toRem(15),
	},
	muscleGroupEditButton: {
		border: 'none',
		backgroundColor: 'rgba(255, 255, 255, 0.08)',
		color: colors.blueLight,
		width: toRem(28),
		height: toRem(28),
		borderRadius: '50%',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		cursor: 'pointer',
		flexShrink: 0,
	},
	muscleGroupCardCount: {
		color: colors.blueLight,
		fontSize: toRem(12),
		fontWeight: '700',
		textTransform: 'uppercase',
		letterSpacing: '0.04em',
	},
	muscleGroupCreateRow: {
		display: 'flex',
		gap: toRem(10),
		alignItems: 'stretch',
	},
	muscleGroupCreateButton: {
		backgroundColor: mainColor || colors.green,
		color: colors.black,
		border: 'none',
		borderRadius: toRem(8),
		padding: `${toRem(10)} ${toRem(14)}`,
		fontWeight: '700',
		cursor: 'pointer',
		whiteSpace: 'nowrap',
	},
	exerciseGroupSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(10),
		marginBottom: toRem(24),
	},
	exerciseGroupHeader: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'space-between',
		gap: toRem(12),
		paddingBottom: toRem(8),
		borderBottom: `1px solid rgba(255, 255, 255, 0.08)`,
	},
	exerciseGroupTitle: {
		color: colors.white,
		fontSize: toRem(18),
		fontWeight: '700',
		margin: 0,
	},
	exerciseGroupCount: {
		color: colors.blueLight,
		fontSize: toRem(13),
		fontWeight: '600',
		textTransform: 'uppercase',
		letterSpacing: '0.04em',
	},
	// Основной контейнер
	container: {
		minHeight: '100vh',
		padding: `${toRem(20)} ${toRem(20)} ${toRem(100)}`,
	},
	// Хедер
	header: {
		marginBottom: toRem(30),
		paddingBottom: toRem(20),
		borderBottom: `2px solid ${colors.blueLight}`,
	},

	// Заголовок
	title: {
		fontSize: toRem(24),
		fontWeight: '700',
		color: colors.white,
		margin: `0 0 ${toRem(10)} 0`,
		lineHeight: 1.3,
	},

	// Дата
	date: {
		fontSize: toRem(18),
		color: colors.blueLight,
		fontWeight: '600',
		margin: 0,
		opacity: 0.9,
	},

	// Сообщение "нет упражнений"
	noExercises: {
		textAlign: 'center',
		color: colors.gray,
		fontSize: toRem(16),
		padding: `${toRem(40)} ${toRem(20)}`,
		fontStyle: 'italic',
		backgroundColor: 'rgba(24, 30, 35, 0.5)',
		borderRadius: toRem(10),
		margin: `${toRem(20)} 0`,
	},

	// Сообщение об ошибке
	error: {
		textAlign: 'center',
		color: colors.red,
		fontSize: toRem(16),
		padding: toRem(20),
		backgroundColor: 'rgba(227, 60, 63, 0.1)',
		borderRadius: toRem(10),
		margin: `${toRem(20)} 0`,
	},

	// Кнопка добавления упражнения
	addButton: {
		backgroundColor: mainColor || colors.green,
		border: 'none',
		borderRadius: toRem(12),
		padding: toRem(20),
		color: colors.black,
		fontSize: toRem(18),
		fontWeight: 'bold',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: toRem(10),
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		zIndex: 100,
		marginTop: toRem(20),
		width: '100%',
	},

	// Модальное окно
	modalOverlay: {
		position: 'fixed',
		top: 0,
		left: 0,
		width: '100%',
		height: '100%',
		zIndex: 1000,
		display: 'flex',
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: 'rgba(12, 14, 20, 0.8)',
	},

	modalContent: {
		position: 'relative',
		backgroundColor: colors.labelBG,
		borderRadius: toRem(12),
		padding: toRem(30),
		maxWidth: toRem(400),
		width: '90%',
		border: `2px solid ${colors.blueLight}`,
		boxShadow: `0 10px 40px rgba(0, 200, 255, 0.2)`,
	},

	modalTitle: {
		fontSize: toRem(20),
		fontWeight: 'bold',
		color: colors.white,
		marginBottom: toRem(20),
		textAlign: 'center',
	},

	exerciseInput: {
		width: '100%',
		padding: `${toRem(12)} ${toRem(16)}`,
		backgroundColor: colors.white,
		border: `1px solid ${colors.inputBorder}`,
		borderRadius: toRem(8),
		fontSize: toRem(16),
		color: colors.black,
		marginBottom: toRem(20),
		'&:focus': {
			outline: 'none',
			borderColor: colors.blueLight,
			boxShadow: `0 0 0 2px rgba(0, 200, 255, 0.2)`,
		},
	},

	saveButton: {
		width: '100%',
		padding: `${toRem(15)} ${toRem(20)}`,
		backgroundColor: mainColor || colors.green,
		border: 'none',
		borderRadius: toRem(10),
		color: colors.black,
		fontSize: toRem(16),
		fontWeight: 'bold',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		'&:hover': {
			backgroundColor: '#7ac22a',
			transform: 'translateY(-2px)',
		},
		'&:active': {
			transform: 'translateY(0)',
		},
	},

	// Стили для Templates
	templatesContainer: {
		marginBottom: toRem(30),
	},

	templatesTitle: {
		fontSize: toRem(18),
		color: colors.white,
		fontWeight: '600',
		marginBottom: toRem(15),
		display: 'flex',
		alignItems: 'center',
		gap: toRem(10),
	},

	templatesList: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(10),
		backgroundColor: 'rgba(24, 30, 35, 0.5)',
		borderRadius: toRem(10),
		padding: toRem(15),
	},

	templateItem: {
		backgroundColor: colors.labelBG,
		padding: `${toRem(12)} ${toRem(16)}`,
		borderRadius: toRem(8),
		color: colors.white,
		border: 'none',
		cursor: 'pointer',
		transition: 'all 0.2s ease',
		textAlign: 'left',
		fontSize: toRem(16),
		'&:hover': {
			backgroundColor: 'rgba(0, 200, 255, 0.1)',
			transform: 'translateX(5px)',
		},
	},


	header: {
		marginBottom: toRem(30),
		paddingBottom: toRem(20),
		borderBottom: `2px solid ${colors.blueLight}`,
	},

	title: {
		fontSize: toRem(24),
		fontWeight: '700',
		color: colors.white,
		margin: `0 0 ${toRem(10)} 0`,
		lineHeight: 1.3,
	},

	date: {
		fontSize: toRem(18),
		color: colors.blueLight,
		fontWeight: '600',
		margin: 0,
		opacity: 0.9,
	},

	noExercises: {
		textAlign: 'center',
		color: colors.gray,
		fontSize: toRem(16),
		padding: `${toRem(40)} ${toRem(20)}`,
		fontStyle: 'italic',
		backgroundColor: 'rgba(24, 30, 35, 0.5)',
		borderRadius: toRem(10),
		margin: `${toRem(20)} 0`,
	},

	error: {
		textAlign: 'center',
		color: colors.red,
		fontSize: toRem(16),
		padding: toRem(20),
		backgroundColor: 'rgba(227, 60, 63, 0.1)',
		borderRadius: toRem(10),
		margin: `${toRem(20)} 0`,
	},

	list: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(15),
		paddingBottom: toRem(120),
	},


	// ========== СТИЛИ ДЛЯ КОМПОНЕНТА EXERCISEITEM ==========
	exerciseBlock: {
		backgroundColor: colors.labelBG,
		borderRadius: toRem(12),
		overflow: 'hidden',
		border: `1px solid ${colors.labelBG}`,
		transition: 'all 0.3s ease',
	},

	exerciseHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	exerciseContent: {
		display: 'flex',
		alignItems: 'center',
		gap: toRem(10),
		flexWrap: 'wrap',
		flex: 1,
		minWidth: 0,
	},

	exerciseTitle: {
		fontSize: toRem(18),
		fontWeight: '600',
		color: colors.white,
		backgroundColor: 'transparent',
		border: 'none',
		padding: toRem(15),
		textAlign: 'left',
		flex: 1,
		transition: 'all 0.3s ease',
		'&:hover': {
			color: colors.blueLight,
		},
	},
	muscleGroupBadge: {
		backgroundColor: 'rgba(0, 200, 255, 0.12)',
		border: `1px solid rgba(0, 200, 255, 0.35)`,
		borderRadius: toRem(999),
		color: colors.blueLight,
		fontSize: toRem(12),
		fontWeight: '700',
		padding: `${toRem(4)} ${toRem(10)}`,
		marginLeft: toRem(4),
	},
	exerciseActions: {
		display: 'flex',
		alignItems: 'center',
	},

	deleteExerciseBtn: {
		backgroundColor: 'transparent',
		border: 'none',
		color: colors.red,
		fontSize: toRem(16),
		cursor: 'pointer',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: toRem(6),
		transition: 'all 0.3s ease',
		padding: toRem(15),
	},

	// ========== СТИЛИ ДЛЯ КОМПОНЕНТА WEIGHTS ==========
	noWeights: {
		textAlign: 'center',
		color: colors.gray,
		fontSize: toRem(14),
		padding: toRem(15),
		fontStyle: 'italic',
	},
	weightBlock: {
		display: 'flex',
		alignItems: 'center',
		paddingLeft: toRem(15),
		paddingRight: toRem(15),
		paddingBottom: toRem(10),
		gap: toRem(10),
	},

	weightButton: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},

	weightText: {
		fontSize: toRem(16),
		color: colors.white,
		whiteSpace: 'nowrap',
	},

	deleteWeightBtn: {
		backgroundColor: colors.red,
		padding: toRem(5) + ' ' + toRem(10),
		borderRadius: toRem(10),
		marginRight: toRem(30),
	},

	// ========== СТИЛИ ДЛЯ КОМПОНЕНТА REPS/SETS ==========
	setText: {
		color: colors.white,
		fontSize: toRem(14),
	},

	deleteBtn: {
		backgroundColor: 'transparent',
		border: 'none',
		color: colors.red,
		fontSize: toRem(12),
		cursor: 'pointer',
		width: toRem(24),
		height: toRem(24),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: toRem(4),
		transition: 'all 0.3s ease',
		'&:hover': {
			backgroundColor: 'rgba(227, 60, 63, 0.1)',
			transform: 'scale(1.1)',
		},
	},
	repsContainer: {
		display: 'flex',
		alignItems: 'center',
		gap: toRem(10),
	},
	repsContainerRow: {
		display: 'flex',
		alignItems: 'center',
		columnGap: toRem(5),
		flexWrap: 'wrap',
	},
	addSetBtn: {
		border: `1px solid ${mainColor || colors.green}`,
		color: colors.white,
		fontSize: toRem(14),
		padding: `${toRem(5)} ${toRem(10)}`,
		borderRadius: toRem(6),
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		backgroundColor: mainColor || colors.green,
		whiteSpace: 'nowrap',
	},
	addWeightBtn: {
		border: `1px dashed ${colors.blueLight}`,
		color: colors.white,
		fontSize: toRem(14),
		padding: `${toRem(5)} ${toRem(10)}`,
		borderRadius: toRem(6),
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		backgroundColor: 'rgba(0, 200, 255,1)',
		margin: toRem(10),
	},
	// ========== СТИЛИ ДЛЯ КОМПОНЕНТА ADDWEIGHT ==========
	addWeightContainer: {
		padding: toRem(15),
		borderTop: `1px solid ${colors.labelBG}`,
	},

	addWeightInput: {
		width: 'calc(100% - 50px)',
		padding: `${toRem(10)} ${toRem(12)}`,
		backgroundColor: colors.white,
		border: `1px solid ${colors.inputBorder}`,
		borderRadius: toRem(6),
		fontSize: toRem(14),
		color: colors.black,
		marginRight: toRem(10),
		'&:focus': {
			outline: 'none',
			borderColor: colors.blueLight,
		},
	},

	addWeightButton: {
		backgroundColor: mainColor || colors.green,
		border: 'none',
		color: colors.black,
		padding: `${toRem(10)} ${toRem(16)}`,
		borderRadius: toRem(6),
		fontSize: toRem(14),
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		'&:hover': {
			backgroundColor: '#7ac22a',
			transform: 'translateY(-2px)',
		},
	},

	// ========== МОДАЛЬНЫЕ ОКНА (используем commonStyle) ==========


	modalTitle: {
		fontSize: toRem(20),
		fontWeight: 'bold',
		color: colors.white,
		marginBottom: toRem(20),
		textAlign: 'center',
	},

	modalButtons: {
		display: 'flex',
		gap: toRem(10),
		marginTop: toRem(20),
	},

});
