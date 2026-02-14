// DateItemStyles.js (дополнительный файл для стилей DateItem)
import { commonStyle, colors, toRem } from '../../../styles/commonStyle';

export const dateItemStyles = {
	// Контейнер элемента даты
	container: {
		display: 'flex',
		alignItems: 'center',
		backgroundColor: colors.labelBG,
		borderRadius: toRem(12),
		cursor: 'pointer',
		transition: 'all 0.3s ease',
		overflow: 'hidden',
		height: toRem(60),
	},

	// Стиль для сегодняшней даты
	todayHighlight: {
		backgroundColor: colors.blueLight,
	},

	// Кнопка с датой
	dateButton: {
		cursor: 'pointer',
		flex: 1,
		display: 'flex',
		alignItems: 'center',
		gap: toRem(10),
		paddingLeft: toRem(15),

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
		backgroundColor: colors.red,
		paddingInline: toRem(20),
		display: 'block',
		height: '100%',
	},

	// Текст кнопки удаления
	deleteIcon: {
		// color: colors.red,
		fontSize: toRem(16),
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