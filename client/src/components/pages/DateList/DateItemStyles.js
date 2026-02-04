// DateItemStyles.js (дополнительный файл для стилей DateItem)
import { commonStyle, colors, toRem } from '../../../styles/commonStyle';

export const dateItemStyles = {
	// Контейнер элемента даты
	container: {
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		backgroundColor: colors.labelBG,
		borderRadius: toRem(12),
		marginBottom: toRem(10),
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
	todayHighlight: {
		backgroundColor: colors.blueLight,
	},

	// Кнопка с датой
	dateButton: {
		backgroundColor: 'transparent',
		border: 'none',
		cursor: 'pointer',
		flex: 1,
		textAlign: 'left',
		padding: 0,
		display: 'flex',
		alignItems: 'center',
		gap: toRem(10),
		padding: toRem(15) + ' ' + toRem(20),

	},

	// Текст даты
	dateText: {
		fontSize: toRem(18),
		color: colors.white,
		letterSpacing: '1px',
	},

	// Стиль для текста сегодняшней даты
	todayText: {
		fontWeight: 'bold',
	},

	// Кнопка удаления
	deleteButton: {
		backgroundColor: 'transparent',
		border: 'none',
		cursor: 'pointer',
		padding: toRem(8),
		borderRadius: toRem(6),
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		transition: 'all 0.3s ease',
		padding: toRem(15) + ' ' + toRem(20),
		'&:hover': {
			backgroundColor: 'rgba(227, 60, 63, 0.1)',
			transform: 'scale(1.1)',
		},
	},

	// Текст кнопки удаления
	deleteText: {
		color: colors.red,
		fontSize: toRem(16),
		fontWeight: 'bold',
		transition: 'all 0.3s ease',
		'&:hover': {
			color: colors.orange,
		},
	},

	// Бейдж "Сегодня"
	todayBadge: {
		fontSize: toRem(12),
		fontWeight: 'bold',
		padding: `${toRem(2)} ${toRem(8)}`,
		backgroundColor: colors.white,
		color: colors.black,
		borderRadius: toRem(4),
		marginLeft: toRem(10),
	},

	// Счетчик упражнений (если нужно добавить)
	exercisesCount: {
		fontSize: toRem(14),
		color: colors.blueLight,
		opacity: 0.8,
		marginLeft: 'auto',
		marginRight: toRem(15),
		fontStyle: 'italic',
	},
};