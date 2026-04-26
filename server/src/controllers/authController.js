import User from '../models/User.js';
import TrainingFile from '../models/TrainingFile.js';
import { generateToken, verifyGoogleToken } from '../utils/jwt.js';
import { sendPasswordResetEmail } from '../utils/email.js';
import crypto from 'crypto';

const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000;

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

const hashResetToken = (token) => crypto.createHash('sha256').update(String(token || '')).digest('hex');

const getPasswordResetBaseUrl = () => {
  const explicitUrl = String(process.env.PASSWORD_RESET_URL || '').trim();
  if (explicitUrl) {
    return explicitUrl.replace(/\/+$/, '');
  }

  const clientUrl = String(process.env.CLIENT_URL || '').trim();
  if (!clientUrl) {
    throw new Error('CLIENT_URL or PASSWORD_RESET_URL must be configured');
  }

  return `${clientUrl.replace(/\/+$/, '')}/reset-password`;
};

const buildPasswordResetUrl = (token) => {
  const baseUrl = getPasswordResetBaseUrl();
  return `${baseUrl}/${encodeURIComponent(token)}`;
};

export const register = async (req, res) => {
  try {
    const { name, weight, password } = req.body;
    const email = normalizeEmail(req.body.email);

    const existingUsers = await User.find({ email }).select('+password').sort({ createdAt: 1, _id: 1 });
    const passwordUser = existingUsers.find((user) => user.password);
    const googleOnlyUser = existingUsers.find((user) => user.googleId && !user.password);

    if (passwordUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists',
      });
    }

    if (googleOnlyUser) {
      if (!ensureActiveUser(googleOnlyUser, res)) return;

      googleOnlyUser.password = password;

      if (!googleOnlyUser.name && name) {
        googleOnlyUser.name = name;
      }

      if ((googleOnlyUser.weight === null || googleOnlyUser.weight === undefined) && weight !== undefined) {
        googleOnlyUser.weight = weight;
      }

      await googleOnlyUser.save();

      const linkedToken = generateToken(googleOnlyUser);

      return res.status(200).json({
        success: true,
        message: 'Password added successfully. You can now sign in with email or Google.',
        token: linkedToken,
        user: serializeUser(googleOnlyUser),
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
    const email = normalizeEmail(req.body.email);
    const { password } = req.body;

    const users = await User.find({ email }).select('+password').sort({ createdAt: 1, _id: 1 });
    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    let matchedUser = null;

    for (const candidate of users) {
      const isPasswordValid = await candidate.comparePassword(password);
      if (isPasswordValid) {
        matchedUser = candidate;
        break;
      }
    }

    if (!matchedUser) {
      const hasGoogleOnlyAccount = users.some((user) => user.googleId && !user.password);

      return res.status(401).json({
        success: false,
        message: hasGoogleOnlyAccount
          ? 'Invalid credentials. This email is also linked to Google Sign-In.'
          : 'Invalid credentials',
      });
    }

    if (!ensureActiveUser(matchedUser, res)) return;

    const token = generateToken(matchedUser);

    res.json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: serializeUser(matchedUser),
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
    });
  }
};

export const forgotPassword = async (req, res) => {
  const successMessage = 'If an account exists for this email, a password reset link has been sent.';

  try {
    const email = normalizeEmail(req.body.email);
    const users = await User.find({ email }).select('+password').sort({ createdAt: 1, _id: 1 });
    const resetUser =
      users.find((candidate) => !candidate.isDeleted && candidate.accountStatus === 'active' && candidate.password) ||
      users.find((candidate) => !candidate.isDeleted && candidate.accountStatus === 'active');

    if (!resetUser) {
      return res.json({
        success: true,
        message: successMessage,
      });
    }

    const rawResetToken = crypto.randomBytes(32).toString('hex');
    resetUser.passwordResetToken = hashResetToken(rawResetToken);
    resetUser.passwordResetExpiresAt = new Date(Date.now() + PASSWORD_RESET_TTL_MS);
    await resetUser.save();

    try {
      await sendPasswordResetEmail({
        to: resetUser.email,
        name: resetUser.name,
        resetUrl: buildPasswordResetUrl(rawResetToken),
      });
    } catch (emailError) {
      resetUser.passwordResetToken = null;
      resetUser.passwordResetExpiresAt = null;
      await resetUser.save();

      console.error('Forgot password email error:', emailError);
      return res.status(500).json({
        success: false,
        message: 'Password recovery email is not configured on the server',
      });
    }

    res.json({
      success: true,
      message: successMessage,
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password recovery',
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;
    const hashedToken = hashResetToken(token);

    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpiresAt: { $gt: new Date() },
    }).select('+password +passwordResetToken +passwordResetExpiresAt');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'This password reset link is invalid or has expired',
      });
    }

    if (!ensureActiveUser(user, res)) return;

    user.password = password;
    user.passwordResetToken = null;
    user.passwordResetExpiresAt = null;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully. You can now sign in with your new password.',
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during password reset',
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

    const normalizedGoogleEmail = normalizeEmail(googleProfile.email);

    let user = await User.findOne({
      googleId: googleProfile.googleId,
    }).select('+password');

    if (!user) {
      const usersWithEmail = await User.find({ email: normalizedGoogleEmail }).select('+password').sort({ createdAt: 1, _id: 1 });

      if (usersWithEmail.length > 0) {
        user = usersWithEmail.find((candidate) => candidate.password) || usersWithEmail[0];
      }
    }

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
        email: normalizedGoogleEmail,
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
