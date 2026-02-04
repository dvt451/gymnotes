import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

export const register = async (req, res) => {
	try {
		const { name, weight, email, password } = req.body;

		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: 'User already exists'
			});
		}

		const user = new User({ name, weight, email, password });
		await user.save();

		const token = generateToken(user._id);

		res.status(201).json({
			success: true,
			message: 'User registered successfully',
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				weight: user.weight
			}
		});
	} catch (error) {
		console.error('Registration error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error during registration'
		});
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await User.findOne({ email });
		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials'
			});
		}

		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials'
			});
		}

		const token = generateToken(user._id);

		res.json({
			success: true,
			message: 'Logged in successfully',
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				weight: user.weight
			}
		});
	} catch (error) {
		console.error('Login error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error during login'
		});
	}
};

export const getProfile = async (req, res) => {
	try {
		const user = await User.findById(req.userId).select('-password');

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		res.json({
			success: true,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				weight: user.weight,
				trainingfiles: user.trainingfiles,
				trainingOrder: user.trainingOrder
			}
		});
	} catch (error) {
		console.error('Get profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error'
		});
	}
};

export const updateProfile = async (req, res) => {
	try {
		const { name, weight } = req.body;
		const user = await User.findById(req.userId);

		if (!user) {
			return res.status(404).json({
				success: false,
				message: 'User not found'
			});
		}

		if (name) user.name = name;
		if (weight !== undefined) user.weight = weight;

		await user.save();

		res.json({
			success: true,
			message: 'Profile updated successfully',
			user: {
				name: user.name,
				weight: user.weight
			}
		});
	} catch (error) {
		console.error('Update profile error:', error);
		res.status(500).json({
			success: false,
			message: 'Server error'
		});
	}
};