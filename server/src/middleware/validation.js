const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const validateRegister = (req, res, next) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password) {
		return res.status(400).json({
			success: false,
			message: 'Name, email and password are required'
		});
	}

	if (!emailRegex.test(email)) {
		return res.status(400).json({
			success: false,
			message: 'Invalid email format'
		});
	}

	if (password.length < 6) {
		return res.status(400).json({
			success: false,
			message: 'Password must be at least 6 characters'
		});
	}

	next();
};

export const validateLogin = (req, res, next) => {
	const { email, password } = req.body;

	if (!email || !password) {
		return res.status(400).json({
			success: false,
			message: 'Email and password are required'
		});
	}

	next();
};

export const validateForgotPassword = (req, res, next) => {
	const { email } = req.body;

	if (!email) {
		return res.status(400).json({
			success: false,
			message: 'Email is required'
		});
	}

	if (!emailRegex.test(email)) {
		return res.status(400).json({
			success: false,
			message: 'Invalid email format'
		});
	}

	next();
};

export const validateResetPassword = (req, res, next) => {
	const { token, password } = req.body;

	if (!token || !password) {
		return res.status(400).json({
			success: false,
			message: 'Reset token and password are required'
		});
	}

	if (password.length < 6) {
		return res.status(400).json({
			success: false,
			message: 'Password must be at least 6 characters'
		});
	}

	next();
};
