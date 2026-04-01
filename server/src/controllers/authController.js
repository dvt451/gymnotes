import User from '../models/User.js';
import TrainingFile from '../models/TrainingFile.js';
import { generateToken, verifyGoogleToken } from '../utils/jwt.js';

const serializeUser = (user, extra = {}) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar || '',
  weight: user.weight,
  role: user.role || 'user',
  accountStatus: user.accountStatus || 'active',
  suspendedAt: user.suspendedAt || null,
  suspensionReason: user.suspensionReason || '',
  isDeleted: user.isDeleted || false,
  deletedAt: user.deletedAt || null,
  deletionReason: user.deletionReason || '',
  ...extra,
});

const ensureActiveUser = (user, res) => {
  if (user.isDeleted) {
    res.status(403).json({
      success: false,
      message: 'Account has been deleted',
    });
    return false;
  }

  if (user.accountStatus === 'suspended') {
    res.status(403).json({
      success: false,
      message: 'Account is suspended',
    });
    return false;
  }

  return true;
};

export const register = async (req, res) => {
  try {
    const { name, weight, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    const user = new User({ name, weight, email, password });
    await user.save();

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error during registration',
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!ensureActiveUser(user, res)) return;

    const token = generateToken(user);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

export const loginWithGoogle = async (req, res) => {
  try {
    const { token } = req.body;
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      return res.status(500).json({
        success: false,
        message: 'Google auth is not configured on the server',
      });
    }

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Google token is required',
      });
    }

    const googleProfile = await verifyGoogleToken(token, googleClientId);
    if (!googleProfile?.email || !googleProfile?.googleId) {
      return res.status(401).json({
        success: false,
        message: 'Invalid Google token',
      });
    }

    let user = await User.findOne({
      $or: [
        { googleId: googleProfile.googleId },
        { email: googleProfile.email.toLowerCase() },
      ],
    }).select('+password');

    if (user) {
      if (!ensureActiveUser(user, res)) return;

      if (!user.googleId) {
        user.googleId = googleProfile.googleId;
      }
      if (!user.avatar && googleProfile.picture) {
        user.avatar = googleProfile.picture;
      }
      if (!user.name && googleProfile.name) {
        user.name = googleProfile.name;
      }

      await user.save();
    } else {
      const fallbackName = googleProfile.name?.trim() || googleProfile.email.split('@')[0];
      user = await User.create({
        name: fallbackName,
        email: googleProfile.email.toLowerCase(),
        googleId: googleProfile.googleId,
        avatar: googleProfile.picture || '',
      });
    }

    const authToken = generateToken(user);

    res.json({
      success: true,
      message: 'Logged in with Google successfully',
      token: authToken,
      user: serializeUser(user),
    });
  } catch (error) {
    console.error('Google login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during Google login',
    });
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const trainingfiles = await TrainingFile.find({ userId: req.userId }).sort({ order: 1, createdAt: 1 });

    res.json({
      success: true,
      user: serializeUser(user, {
        trainingfiles,
        trainingOrder: trainingfiles.map((f) => f._id.toString()),
      }),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
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
        message: 'User not found',
      });
    }

    if (name) user.name = name;
    if (weight !== undefined) user.weight = weight;

    await user.save();

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: serializeUser(user),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
    });
  }
};
