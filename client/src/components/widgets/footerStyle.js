import { colors, toRem } from '../../styles/commonStyle';

export const createFooterStyle = (mainColor) => ({
	footer: {
		padding: toRem(20),
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
	},
	footerLinkIcon: {
		fontSize: toRem(30),
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