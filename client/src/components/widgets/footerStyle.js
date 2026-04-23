import { colors, toRem } from '../../styles/commonStyle';

export const createFooterStyle = (mainColor) => ({
	footer: {
		position: 'fixed',
		bottom: 0,
		left: 0,
		zIndex: 100,
		width: '100%',
	},
	footerContainer: {
		maxWidth: toRem(1200),
		margin: '0 auto',
		backgroundColor: colors.blueDark,
		padding: toRem(20),
		borderRadius: `${toRem(30)} ${toRem(30)} 0 0`,
		boxShadow: '0px 0px 4px #000',
	},
	linkList: {
		display: 'flex',
		justifyContent: 'space-around',
		gap: toRem(10),
	},
	footerLink: {
		display: 'flex',
		flexDirection: 'column',
		alignItems: 'center',
		justifyContent: 'center',
		gap: toRem(5),
		flex: 1,
		textAlign: 'center',
	},
	footerLinkIcon: {
		fontSize: toRem(30),
	},
	footerLinkText: {
		fontSize: toRem(12),
		lineHeight: 1.2,
	},
	footerLinkTextActive: {

	},
	footerLinkTextIconActive: {

	},
	footerLinkActive: {
		color: mainColor || colors.green,
	},
	footerLinkDott: {
		backgroundColor: '#fff',
		width: toRem(10),
		height: toRem(10),
		borderRadius: '50%',
	}
});
