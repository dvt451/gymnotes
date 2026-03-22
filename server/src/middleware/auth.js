import User from '../models/User.js';
import { verifyToken } from '../utils/jwt.js';

const selectAuthenticatedUser = 'name email weight role accountStatus suspendedAt suspensionReason isDeleted deletedAt deletionReason createdAt updatedAt';

export const authMiddleware = async (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).json({
			success: false,
			message: 'No authorization header'
		});
	}

	const token = authHeader.split(' ')[1];

	if (!token) {
		return res.status(401).json({
			success: false,
			message: 'No token provided'
		});
	}

	try {
		const decoded = verifyToken(token);

		if (!decoded) {
			return res.status(401).json({
				success: false,
				message: 'Invalid token'
			});
		}

		const user = await User.findById(decoded.userId).select(selectAuthenticatedUser);

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'User not found'
			});
		}

		if (user.isDeleted) {
			return res.status(403).json({
				success: false,
				message: 'Account has been deleted',
			});
		}

		if (user.accountStatus === 'suspended') {
			return res.status(403).json({
				success: false,
				message: 'Account is suspended',
			});
		}

		req.userId = user._id;
		req.userRole = user.role || decoded.role || null;
		req.currentUser = user;
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: 'Token verification failed'
		});
	}
};

export const requireAdmin = async (req, res, next) => {
	if (!req.userId) {
		return res.status(401).json({
			success: false,
			message: 'Authentication required',
		});
	}

	try {
		const user =
			req.currentUser ||
			await User.findById(req.userId).select(selectAuthenticatedUser);

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'User not found',
			});
		}

		if (user.isDeleted) {
			return res.status(403).json({
				success: false,
				message: 'Account has been deleted',
			});
		}

		if (user.accountStatus === 'suspended') {
			return res.status(403).json({
				success: false,
				message: 'Account is suspended',
			});
		}

		if (user.role !== 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Admin access required',
			});
		}

		req.currentUser = user;
		req.userRole = user.role;
		next();
	} catch (error) {
		return res.status(500).json({
			success: false,
			message: 'Failed to verify admin access',
		});
	}
};

export default authMiddleware;
