import { tr } from 'date-fns/locale';
import { colors, toRem } from '../../styles/commonStyle';



export const headerStyle = {
	header: {
		padding: toRem(18),
		position: 'relative',
		display: 'flex',
		gap: toRem(30),
	},
	user: {
		display: 'flex',
		alignItems: 'center',
		gap: toRem(15),
	},
	avatar: {
		width: toRem(50),
		height: toRem(50),
		backgroundColor: colors.white,
		borderRadius: '50%',
		overflow: 'hidden',
		padding: toRem(5),

	},
	avatarImage: {
		width: '100%',
		height: '100%',
		objectFit: 'cover',
	},
	userInfo: {
		display: 'flex',
		flexDirection: 'column',
	},
	userName: {
		fontSize: toRem(20),
		fontWeight: 'bold',
	},
	userWeight: {
		fontSize: toRem(16),
	},
	backButton: {
		backgroundColor: 'rgba(255, 255, 255, 0.1)',
		border: 'none',
		color: 'white',
		padding: '10px',
		borderRadius: '50%',
		cursor: 'pointer',
		width: '40px',
		height: '40px',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		transition: 'all 0.2s ease',
		zIndex: 10,
	},
	icon: {
		fontSize: '20px',
		transform: 'translateY(-1px)',
	}
}