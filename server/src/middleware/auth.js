import { verifyToken } from '../utils/jwt.js';

export const authMiddleware = (req, res, next) => {
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

		req.userId = decoded.userId;
		next();
	} catch (error) {
		return res.status(401).json({
			success: false,
			message: 'Token verification failed'
		});
	}
};

// Экспортируем по умолчанию для совместимости
export default authMiddleware;