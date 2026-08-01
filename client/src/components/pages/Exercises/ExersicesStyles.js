// ExercisesStyles.js
import { colors, toRem } from '../../../styles/commonStyle';

export const createExercisesStyles = (mainColor) => ({
	// Основной контейнер
	container: {
		backgroundColor: colors.blueDark,
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
		fontSize: toRem(18),
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
	container: {
		backgroundColor: colors.blueDark,
		minHeight: '100vh',
		padding: `${toRem(20)} ${toRem(20)} ${toRem(100)}`,
	},

	header: {
		marginBottom: toRem(30),
		paddingBottom: toRem(20),
		borderBottom: `2px solid ${colors.blueLight}`,
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
		paddingBottom: toRem(20),
	},

	addButton: {
		position: 'fixed',
		left: toRem(20),
		bottom: toRem(20),
		border: 'none',
		fontSize: toRem(18),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: toRem(10),
		cursor: 'pointer',
		zIndex: 100,
		width: `calc(100% - ${toRem(40)})`,
	},

	// ========== СТИЛИ ДЛЯ КОМПОНЕНТА EXERCISEITEM ==========
	exerciseBlock: {
		// backgroundColor: '#12151a',
		backgroundColor: '#21242b',
		backgroundColor: colors.labelBG + '99',
		borderRadius: toRem(12),
		overflow: 'hidden',
		border: `1px solid #252628`,
		transition: 'all 0.3s ease',
	},

	exerciseHeader: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		padding: toRem(15),
		paddingBottom: 0,
		gap: toRem(15),
	},

	exerciseNumber: {
		fontSize: toRem(14),
		fontWeight: '600',
		width: toRem(30),
		height: toRem(30),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		color: colors.green,
		border: `1px solid ${colors.green}`,
		borderRadius: '50%',
	},

	exerciseTitle: {
		fontSize: toRem(18),
		fontWeight: '600',
		color: colors.white,
		backgroundColor: 'transparent',
		border: 'none',
		textAlign: 'left',
		flex: 1,
		transition: 'all 0.3s ease',
		'&:hover': {
			color: colors.blueLight,
		},
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
	exerciseCommentSection: {
		display: 'flex',
		flexDirection: 'column',
		gap: toRem(6),
		padding: `0 ${toRem(15)} ${toRem(15)}`,
	},

	exerciseCommentRow: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		gap: toRem(8),
	},

	exerciseCommentDisplayButton: {
		background: 'transparent',
		border: 'none',
		padding: 0,
		margin: 0,
		display: 'flex',
		alignItems: 'center',
		flex: 1,
		textAlign: 'left',
		cursor: 'pointer',
	},

	exerciseCommentText: {
		fontSize: toRem(14),
		lineHeight: 1.4,
		color: colors.white,
		whiteSpace: 'pre-wrap',
		wordBreak: 'break-word',
	},

	exerciseCommentPlaceholder: {
		fontSize: toRem(14),
		lineHeight: 1.4,
		color: colors.white,
		opacity: 0.3,
	},

	exerciseCommentInput: {
		flex: 1,
		width: '100%',
		padding: `${toRem(7)} ${toRem(10)}`,
		backgroundColor: colors.white,
		border: `1px solid ${colors.inputBorder}`,
		borderRadius: toRem(4),
		fontSize: toRem(13),
		lineHeight: 1.3,
		color: colors.black,
		boxSizing: 'border-box',
	},

	exerciseCommentIconButton: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		width: toRem(38),
		height: toRem(32),
		border: 'none',
		borderRadius: toRem(6),
		cursor: 'pointer',
		flexShrink: 0,
	},

	exerciseCommentEditButton: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: toRem(6),
		color: colors.white,
		whiteSpace: 'nowrap',
		border: toRem(1) + ' solid #252628',
		width: '100%',
		borderRadius: toRem(6),
		padding: toRem(10),
	},

	exerciseCommentConfirmButton: {
		backgroundColor: mainColor || colors.green,
		color: colors.white,
	},

	exercisePreviousCommentRow: {
		display: 'flex',
		alignItems: 'baseline',
		gap: toRem(6),
		flexWrap: 'wrap',
		paddingLeft: toRem(60),
		paddingBottom: toRem(5),
	},

	exercisePreviousCommentText: {
		fontSize: toRem(14),
		lineHeight: 1.4,
		whiteSpace: 'pre-wrap',
		wordBreak: 'break-word',
	},

	exerciseCommentError: {
		margin: 0,
		color: colors.red,
		fontSize: toRem(12),
	},

	noWeights: {
		textAlign: 'center',
		color: colors.gray,
		fontSize: toRem(14),
		padding: toRem(15),
		fontStyle: 'italic',
	},
	settingsRow: {
		display: 'flex',
		flexDirection: 'column',
		rowGap: toRem(6),
		marginTop: toRem(10)
	},

	PrevWeightBlock: {
		display: 'flex',
		alignItems: 'center',
		paddingLeft: toRem(60),
		paddingRight: toRem(15),
		paddingBottom: toRem(10),
		color: "#727578",
		fontSize: toRem(14),
		gap: toRem(8),
	},
	weightsContainer: {
		padding: toRem(0) + ' ' + toRem(15) + ' ' + toRem(10),
		marginTop: toRem(10),
	},
	weightBlock: {
		display: 'flex',
		flexDirection: 'column',
		padding: toRem(10) + ' ' + toRem(15),
		gap: toRem(10),
		// backgroundColor: '#21242b',
		backgroundColor: 'rgba(27, 30, 37, 1)',
		borderRadius: toRem(8),
	},

	weightButton: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
	},

	weightText: {
		fontSize: toRem(18),
		fontWeight: '600',
		color: colors.white,
		whiteSpace: 'nowrap',
	},

	deleteWeightBtn: {
		backgroundColor: colors.red,
		padding: toRem(6) + ' ' + toRem(20),
		borderRadius: toRem(10),
	},

	// ========== СТИЛИ ДЛЯ КОМПОНЕНТА REPS/SETS ==========
	setText: {
		color: colors.green,
		fontSize: toRem(18),
	},
	prevWeightHeader: {
		display: 'flex',
		alignItems: 'center',
		whiteSpace: 'nowrap',
		gap: toRem(5),
	},
	PrevWeightText: {
		display: 'flex',
	},
	PrevSetText: {
	},
	prevMetaText: {
		color: colors.blueLight,
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
		display: 'grid',
		gridTemplateColumns: '1fr 1fr 1fr 1fr',
		alignItems: 'center',
		textAlign: 'center',
		gap: toRem(10),
		flexWrap: 'wrap',
	},
	addSetBtn: {
		fontSize: toRem(16),
		backgroundColor: '#21242b',
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		whiteSpace: 'nowrap',
		border: toRem(1) + ' dashed ' + colors.popupBorderColor,
		padding: toRem(5) + ' ' + toRem(18),
		borderRadius: '0.4em',
		margin: '0',
	},
	addWeightBtn: {
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		padding: toRem(10) + ' ' + toRem(15),
		gap: toRem(20),
		backgroundColor: '#21242b',
		borderRadius: toRem(8),
		width: '100%',
		fontSize: toRem(16),
		color: colors.orange,
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
