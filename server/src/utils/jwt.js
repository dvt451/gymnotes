import jwt from 'jsonwebtoken';

export const generateToken = (user) => {
	const payload =
		typeof user === 'object' && user !== null
			? {
				userId: user.userId || user.id || user._id,
				role: user.role,
			}
			: { userId: user };

	return jwt.sign(payload, process.env.JWT_SECRET, {
		expiresIn: process.env.JWT_EXPIRE || '7d',
	});
};

export const verifyToken = (token) => {
	try {
		return jwt.verify(token, process.env.JWT_SECRET);
	} catch (error) {
		return null;
	}
};

export const verifyGoogleToken = async (token, clientId) => {
	try {
		if (!token || !clientId) return null;

		const response = await fetch(
			`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(token)}`
		);
		if (!response.ok) return null;

		const payload = await response.json();
		const emailVerified = String(payload.email_verified).toLowerCase() === 'true';

		if (!emailVerified) return null;
		if (payload.aud !== clientId) return null;

		return {
			email: payload.email || '',
			name: payload.name || '',
			googleId: payload.sub || '',
			picture: payload.picture || '',
		};
	} catch (error) {
		return null;
	}
};
