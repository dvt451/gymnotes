import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
	const payload =
		typeof user === 'object' && user !== null
			? {
				userId: user.userId || user.id || user._id,
				role: user.role,
			}
			: { userId: user };

	return jwt.sign(
		payload,
		process.env.JWT_SECRET,
		{ expiresIn: process.env.JWT_EXPIRE || '7d' }
	);
};

export const verifyToken = (token) => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		return null;
	}
};

// Для совместимости с Google аутентификацией
export const verifyGoogleToken = async (token, clientId) => {
	try {
		// Здесь будет логика для Google токенов
		// Пока заглушка
		return { email: '', name: '' };
	} catch (error) {
		return null;
	}
};
