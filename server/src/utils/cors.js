const DEFAULT_DEV_ORIGINS = [
	'http://localhost:5173',
	'http://127.0.0.1:5173',
	'http://localhost:5174',
	'http://127.0.0.1:5174',
];

const normalizeOrigin = (origin) => String(origin || '').trim().replace(/\/+$/, '');

export const getAllowedOrigins = () => {
	const configuredOrigins = [
		process.env.CLIENT_URL,
		process.env.ADMIN_URL,
		process.env.ALLOWED_ORIGINS,
	]
		.flatMap((value) => String(value || '').split(','))
		.map(normalizeOrigin)
		.filter(Boolean);

	const defaults = process.env.NODE_ENV === 'development' ? DEFAULT_DEV_ORIGINS : [];

	return [...new Set([...configuredOrigins, ...defaults].map(normalizeOrigin).filter(Boolean))];
};

export const createCorsOptions = () => {
	const allowedOrigins = getAllowedOrigins();

	return {
		origin(origin, callback) {
			if (!origin) {
				return callback(null, true);
			}

			if (allowedOrigins.length === 0 || allowedOrigins.includes(normalizeOrigin(origin))) {
				return callback(null, true);
			}

			return callback(new Error(`Origin ${origin} is not allowed by CORS`));
		},
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization'],
	};
};
