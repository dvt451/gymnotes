import { colors, toRem } from '../../styles/commonStyle';

export const createSelectStyle = (mainColor) => ({
	container: {
		position: 'relative',
		color: colors.black,
		zIndex: 1,
		minWidth: toRem(130),
	},
	containerActive: {
		zIndex: 4,
	},
	trigger: {
		position: 'relative',
		display: 'flex',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		border: `${toRem(1)} solid ${colors.inputBorder}`,
		borderRadius: toRem(5),
		backgroundColor: colors.white,
		color: colors.black,
		padding: `${toRem(10)} ${toRem(12)}`,
		cursor: 'pointer',
		fontSize: toRem(16),
		textAlign: 'left',
	},
	triggerOpen: {
		backgroundColor: mainColor || colors.green,
		color: colors.white,
		fontWeight: 700,
	},
	triggerDisabled: {
		opacity: 0.6,
		cursor: 'not-allowed',
	},
	selectedContent: {
		display: 'flex',
		alignItems: 'center',
		gap: toRem(8),
		minWidth: 0,
		flex: 1,
	},
	selectedText: {
		overflow: 'hidden',
		textOverflow: 'ellipsis',
		whiteSpace: 'nowrap',
	},
	icon: {
		width: toRem(12),
		height: toRem(12),
		flex: '0 0 auto',
		transition: 'transform 0.3s ease',
	},
	iconOpen: {
		transform: 'rotate(-180deg)',
	},
	optionList: {
		display: 'none',
		position: 'absolute',
		top: '100%',
		left: 0,
		width: '100%',
		marginTop: toRem(5),
		zIndex: 5,
		overflowY: 'auto',
		maxHeight: toRem(130),
		borderRadius: toRem(5),
		boxShadow: '0 5px 5px rgba(0, 0, 0, 1)',
		backgroundColor: '#fcf9f9',
	},
	optionListOpen: {
		display: 'block',
	},
	option: {
		whiteSpace: 'nowrap',
		width: '100%',
		textAlign: 'left',
		border: `${toRem(1)} solid ${colors.inputBorder}`,
		backgroundColor: '#fcf9f9',
		color: colors.black,
		padding: toRem(10),
		cursor: 'pointer',
	},
	optionFirst: {
		borderTop: 'none',
	},
	optionNotLast: {
		borderBottom: 'none',
	},
	optionActive: {
		backgroundColor: colors.blueLight,
		color: colors.block,
		fontWeight: 700,
	},
});
