import express from 'express';
import mongoose from 'mongoose';
import User from '../models/User.js';
import TrainingFile from '../models/TrainingFile.js';
import TrainingDate from '../models/TrainingDate.js';
import ExerciseEntry from '../models/ExerciseEntry.js';
import Template from '../models/Template.js';
import ExerciseUserLibrary from '../models/ExerciseUserLibrary.js';
import UserMuscleGroup from '../models/UserMuscleGroup.js';
import AdminAuditLog from '../models/AdminAuditLog.js';
import { generateToken } from '../utils/jwt.js';
import { authMiddleware, requireAdmin } from '../middleware/auth.js';
import { validateLogin } from '../middleware/validation.js';
import { logAdminAction } from '../utils/adminAudit.js';

const router = express.Router();

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_AUDIT_PAGE_SIZE = 25;
const NOT_DELETED_MATCH = { $ne: true };
const ACTIVE_ACCOUNT_MATCH = { $ne: 'suspended' };
const BACKUP_FORMAT = 'gymnotes-backup';
const BACKUP_VERSION = 1;
const BACKUP_COLLECTIONS = [
	{ key: 'users', model: User },
	{ key: 'trainingFiles', model: TrainingFile },
	{ key: 'trainingDates', model: TrainingDate },
	{ key: 'exerciseEntries', model: ExerciseEntry },
	{ key: 'templates', model: Template },
	{ key: 'exerciseUserLibraries', model: ExerciseUserLibrary },
	{ key: 'userMuscleGroups', model: UserMuscleGroup },
	{ key: 'adminAuditLogs', model: AdminAuditLog },
];
const RESTORE_DELETE_ORDER = [...BACKUP_COLLECTIONS].reverse();
const RESTORE_INSERT_ORDER = BACKUP_COLLECTIONS;

const toPositiveInt = (value, fallback) => {
	const parsed = Number(value);
	if (!Number.isFinite(parsed) || parsed <= 0) {
		return fallback;
	}

	return Math.floor(parsed);
};

const toBoolean = (value) => ['1', 'true', 'yes', 'on'].includes(String(value || '').toLowerCase());

const escapeRegex = (value) => String(value || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const isPlainObject = (value) => value !== null && typeof value === 'object' && !Array.isArray(value);

const createBackupFilename = () => {
	const safeTimestamp = new Date().toISOString().replace(/[:.]/g, '-');
	return `gymnotes-backup-${safeTimestamp}.json`;
};

const buildBackupCounts = (collections) =>
	Object.fromEntries(
		BACKUP_COLLECTIONS.map(({ key }) => [key, collections[key]?.length || 0])
	);

const normalizeBackupPayload = (payload) => {
	const backup = isPlainObject(payload?.backup) ? payload.backup : payload;

	if (!isPlainObject(backup)) {
		return {
			error: 'Backup payload must be a JSON object',
		};
	}

	if (backup.format && backup.format !== BACKUP_FORMAT) {
		return {
			error: 'Unsupported backup format',
		};
	}

	if (backup.version && backup.version !== BACKUP_VERSION) {
		return {
			error: `Unsupported backup version: ${backup.version}`,
		};
	}

	const source = isPlainObject(backup.data) ? backup.data : backup;
	const collections = {};

	for (const { key } of BACKUP_COLLECTIONS) {
		const docs = source[key];
		if (!Array.isArray(docs)) {
			return {
				error: `Backup is missing the "${key}" collection`,
			};
		}

		collections[key] = docs.map((doc) => ({ ...doc }));
	}

	return {
		backup,
		collections,
	};
};

const performRestore = async (collections, options = {}) => {
	const dbOptions = options.session ? { session: options.session } : {};

	for (const { model } of RESTORE_DELETE_ORDER) {
		await model.deleteMany({}, dbOptions);
	}

	for (const { key, model } of RESTORE_INSERT_ORDER) {
		const docs = collections[key] || [];
		if (docs.length === 0) {
			continue;
		}

		await model.insertMany(docs, {
			...dbOptions,
			ordered: true,
		});
	}
};

const getDisplayStatus = (user) => {
	if (user?.isDeleted) {
		return 'deleted';
	}

	return user?.accountStatus || 'active';
};

const serializeAdminUser = (user) => ({
	id: user._id,
	name: user.name,
	email: user.email,
	weight: user.weight,
	role: user.role || 'user',
	accountStatus: user.accountStatus || 'active',
	displayStatus: getDisplayStatus(user),
	suspendedAt: user.suspendedAt || null,
	suspensionReason: user.suspensionReason || '',
	isDeleted: user.isDeleted || false,
	deletedAt: user.deletedAt || null,
	deletionReason: user.deletionReason || '',
	createdAt: user.createdAt,
	updatedAt: user.updatedAt,
});

const formatAuditLog = (log) => ({
	id: log._id,
	action: log.action,
	actor: log.actor,
	target: log.target,
	details: log.details || {},
	ipAddress: log.ipAddress || '',
	userAgent: log.userAgent || '',
	createdAt: log.createdAt,
});

const countAdminsExcludingUser = (userId) =>
	User.countDocuments({
		role: 'admin',
		isDeleted: NOT_DELETED_MATCH,
		_id: { $ne: userId },
	});

const countActiveAdminsExcludingUser = (userId) =>
	User.countDocuments({
		role: 'admin',
		accountStatus: ACTIVE_ACCOUNT_MATCH,
		isDeleted: NOT_DELETED_MATCH,
		_id: { $ne: userId },
	});

const ensureManagedUser = async (userId) => {
	if (!mongoose.isValidObjectId(userId)) {
		return null;
	}

	return User.findById(userId);
};

const buildUserQuery = (query) => {
	const search = String(query.search || '').trim();
	const role = String(query.role || '').trim().toLowerCase();
	const status = String(query.status || '').trim().toLowerCase();
	const includeDeleted = toBoolean(query.includeDeleted);

	const match = {};

	if (role && ['user', 'admin'].includes(role)) {
		match.role = role;
	}

	if (status === 'deleted') {
		match.isDeleted = true;
	} else {
		if (!includeDeleted) {
			match.isDeleted = NOT_DELETED_MATCH;
		}

		if (status === 'active') {
			match.accountStatus = ACTIVE_ACCOUNT_MATCH;
		} else if (status === 'suspended') {
			match.accountStatus = status;
		}
	}

	if (search) {
		const regex = new RegExp(escapeRegex(search), 'i');
		match.$or = [
			{ name: regex },
			{ email: regex },
		];
	}

	return {
		match,
		search,
		role: role || 'all',
		status: status || 'all',
		includeDeleted,
	};
};

const buildSort = (query) => {
	const sortBy = String(query.sortBy || 'createdAt');
	const sortOrder = String(query.sortOrder || 'desc').toLowerCase() === 'asc' ? 1 : -1;
	const allowedFields = new Set(['createdAt', 'updatedAt', 'name', 'email']);
	const field = allowedFields.has(sortBy) ? sortBy : 'createdAt';

	return { [field]: sortOrder, _id: sortOrder };
};

router.post('/login', validateLogin, async (req, res) => {
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

		const token = generateToken(user);
		req.currentUser = user;
		await logAdminAction({
			req,
			action: 'admin.login',
			targetUser: user,
			details: { result: 'success' },
		});

		res.json({
			success: true,
			message: 'Admin logged in successfully',
			token,
			user: serializeAdminUser(user),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Server error during admin login',
		});
	}
});

router.use(authMiddleware, requireAdmin);

router.get('/me', async (req, res) => {
	res.json({
		success: true,
		user: serializeAdminUser(req.currentUser),
	});
});

router.get('/overview', async (req, res) => {
	try {
		const [
			totalUsers,
			totalDeletedUsers,
			totalAdmins,
			totalSuspendedUsers,
			totalTrainings,
			totalTrainingDates,
			totalExercises,
			totalTemplates,
			totalAuditLogs,
		] = await Promise.all([
			User.countDocuments({ isDeleted: NOT_DELETED_MATCH }),
			User.countDocuments({ isDeleted: true }),
			User.countDocuments({ role: 'admin', isDeleted: NOT_DELETED_MATCH }),
			User.countDocuments({ accountStatus: 'suspended', isDeleted: NOT_DELETED_MATCH }),
			TrainingFile.countDocuments(),
			TrainingDate.countDocuments(),
			ExerciseEntry.countDocuments(),
			Template.countDocuments(),
			AdminAuditLog.countDocuments(),
		]);

		res.json({
			success: true,
			overview: {
				totalUsers,
				totalDeletedUsers,
				totalAdmins,
				totalSuspendedUsers,
				totalActiveUsers: totalUsers - totalSuspendedUsers,
				totalTrainings,
				totalTrainingDates,
				totalExercises,
				totalTemplates,
				totalAuditLogs,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to load admin overview',
		});
	}
});

router.get('/users', async (req, res) => {
	try {
		const page = toPositiveInt(req.query.page, 1);
		const pageSize = Math.min(toPositiveInt(req.query.pageSize, DEFAULT_PAGE_SIZE), MAX_PAGE_SIZE);
		const { match, search, role, status, includeDeleted } = buildUserQuery(req.query);
		const sort = buildSort(req.query);

		const totalItems = await User.countDocuments(match);
		const users = await User.find(match)
			.select('name email role weight accountStatus suspendedAt suspensionReason isDeleted deletedAt deletionReason createdAt updatedAt')
			.sort(sort)
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.lean();

		const userIds = users.map((user) => user._id);
		const [trainingCounts, libraryCounts] = await Promise.all([
			TrainingFile.aggregate([
				{ $match: { userId: { $in: userIds } } },
				{ $group: { _id: '$userId', count: { $sum: 1 } } },
			]),
			ExerciseUserLibrary.aggregate([
				{ $match: { userId: { $in: userIds } } },
				{ $group: { _id: '$userId', count: { $sum: 1 } } },
			]),
		]);

		const trainingCountByUser = new Map(
			trainingCounts.map((item) => [String(item._id), item.count])
		);
		const libraryCountByUser = new Map(
			libraryCounts.map((item) => [String(item._id), item.count])
		);

		res.json({
			success: true,
			users: users.map((user) => ({
				...serializeAdminUser(user),
				trainingCount: trainingCountByUser.get(String(user._id)) || 0,
				customExerciseCount: libraryCountByUser.get(String(user._id)) || 0,
			})),
			pagination: {
				page,
				pageSize,
				totalItems,
				totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
				hasNext: page * pageSize < totalItems,
				hasPrev: page > 1,
			},
			filters: {
				search,
				role,
				status,
				includeDeleted,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to load users',
		});
	}
});

router.get('/users/:userId', async (req, res) => {
	try {
		const targetUser = await ensureManagedUser(req.params.userId);
		if (!targetUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		const [trainingCount, trainingDateCount, exerciseEntryCount, templateCount, customExerciseCount, auditLogCount, recentTrainings, recentTemplates, recentAuditLogs] =
			await Promise.all([
				TrainingFile.countDocuments({ userId: targetUser._id }),
				TrainingDate.countDocuments({ userId: targetUser._id }),
				ExerciseEntry.countDocuments({ userId: targetUser._id }),
				Template.countDocuments({ userId: targetUser._id }),
				ExerciseUserLibrary.countDocuments({ userId: targetUser._id }),
				AdminAuditLog.countDocuments({ targetUserId: targetUser._id }),
				TrainingFile.find({ userId: targetUser._id })
					.select('name order createdAt updatedAt')
					.sort({ updatedAt: -1, _id: -1 })
					.limit(5)
					.lean(),
				Template.find({ userId: targetUser._id })
					.select('name createdAt updatedAt')
					.sort({ updatedAt: -1, _id: -1 })
					.limit(5)
					.lean(),
				AdminAuditLog.find({ targetUserId: targetUser._id })
					.sort({ createdAt: -1, _id: -1 })
					.limit(10)
					.lean(),
			]);

		res.json({
			success: true,
			user: serializeAdminUser(targetUser),
			summary: {
				trainingCount,
				trainingDateCount,
				exerciseEntryCount,
				templateCount,
				customExerciseCount,
				auditLogCount,
			},
			recentTrainings: recentTrainings.map((item) => ({
				id: item._id,
				name: item.name,
				order: item.order,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			})),
			recentTemplates: recentTemplates.map((item) => ({
				id: item._id,
				name: item.name,
				createdAt: item.createdAt,
				updatedAt: item.updatedAt,
			})),
			recentAuditLogs: recentAuditLogs.map(formatAuditLog),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to load user details',
		});
	}
});

router.get('/audit-logs', async (req, res) => {
	try {
		const page = toPositiveInt(req.query.page, 1);
		const pageSize = Math.min(toPositiveInt(req.query.pageSize, DEFAULT_AUDIT_PAGE_SIZE), MAX_PAGE_SIZE);
		const search = String(req.query.search || '').trim();
		const match = {};

		if (search) {
			const regex = new RegExp(escapeRegex(search), 'i');
			match.$or = [
				{ action: regex },
				{ 'actor.email': regex },
				{ 'target.email': regex },
			];
		}

		const totalItems = await AdminAuditLog.countDocuments(match);
		const logs = await AdminAuditLog.find(match)
			.sort({ createdAt: -1, _id: -1 })
			.skip((page - 1) * pageSize)
			.limit(pageSize)
			.lean();

		res.json({
			success: true,
			logs: logs.map(formatAuditLog),
			pagination: {
				page,
				pageSize,
				totalItems,
				totalPages: Math.max(1, Math.ceil(totalItems / pageSize)),
				hasNext: page * pageSize < totalItems,
				hasPrev: page > 1,
			},
			filters: {
				search,
			},
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to load audit logs',
		});
	}
});

router.get('/system-backup', async (req, res) => {
	try {
		const filename = createBackupFilename();
		const results = await Promise.all(
			BACKUP_COLLECTIONS.map(async ({ key, model }) => [key, await model.find({}).lean()])
		);
		const collections = Object.fromEntries(results);
		const backup = {
			format: BACKUP_FORMAT,
			version: BACKUP_VERSION,
			exportedAt: new Date().toISOString(),
			exportedBy: {
				id: req.currentUser?._id?.toString?.() || null,
				email: req.currentUser?.email || '',
			},
			counts: buildBackupCounts(collections),
			data: collections,
		};

		await logAdminAction({
			req,
			action: 'system.backup_exported',
			targetUser: req.currentUser,
			details: {
				filename,
				counts: backup.counts,
			},
		});

		res.setHeader('Content-Type', 'application/json');
		res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
		res.json({
			success: true,
			backup,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to export system backup',
		});
	}
});

router.post('/system-restore', async (req, res) => {
	try {
		const normalized = normalizeBackupPayload(req.body);
		if (normalized.error) {
			return res.status(400).json({
				success: false,
				message: normalized.error,
			});
		}

		const { backup, collections } = normalized;
		const counts = buildBackupCounts(collections);
		let usedTransaction = true;

		try {
			const session = await mongoose.startSession();

			try {
				await session.withTransaction(async () => {
					await performRestore(collections, { session });
				});
			} finally {
				await session.endSession();
			}
		} catch (error) {
			const message = String(error?.message || '');
			const unsupportedTransactions =
				message.includes('Transaction numbers are only allowed on a replica set member or mongos') ||
				message.includes('Transaction not supported') ||
				message.includes('does not support retryable writes');

			if (!unsupportedTransactions) {
				throw error;
			}

			usedTransaction = false;
			await performRestore(collections);
		}

		await logAdminAction({
			req,
			action: 'system.backup_restored',
			targetUser: req.currentUser,
			details: {
				backupVersion: backup.version || BACKUP_VERSION,
				exportedAt: backup.exportedAt || null,
				usedTransaction,
				counts,
			},
		});

		res.json({
			success: true,
			message: 'System backup restored successfully',
			counts,
			usedTransaction,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to restore system backup',
		});
	}
});

router.patch('/users/:userId/role', async (req, res) => {
	try {
		const { role } = req.body || {};

		if (!['user', 'admin'].includes(role)) {
			return res.status(400).json({
				success: false,
				message: 'Role must be either user or admin',
			});
		}

		const targetUser = await ensureManagedUser(req.params.userId);
		if (!targetUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		if (String(targetUser._id) === String(req.currentUser._id)) {
			return res.status(400).json({
				success: false,
				message: 'You cannot change your own role',
			});
		}

		if (targetUser.isDeleted) {
			return res.status(400).json({
				success: false,
				message: 'Deleted users cannot be updated',
			});
		}

		if (targetUser.role === role) {
			return res.json({
				success: true,
				message: 'Role unchanged',
				user: serializeAdminUser(targetUser),
			});
		}

		if (targetUser.role === 'admin' && role !== 'admin') {
			const otherAdmins = await countAdminsExcludingUser(targetUser._id);
			if (otherAdmins <= 0) {
				return res.status(400).json({
					success: false,
					message: 'You cannot remove the last admin role',
				});
			}
		}

		const previousRole = targetUser.role;
		targetUser.role = role;
		await targetUser.save();

		await logAdminAction({
			req,
			action: 'user.role_updated',
			targetUser,
			details: {
				fromRole: previousRole,
				toRole: role,
			},
		});

		res.json({
			success: true,
			message: 'User role updated successfully',
			user: serializeAdminUser(targetUser),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update user role',
		});
	}
});

router.patch('/users/:userId/status', async (req, res) => {
	try {
		const { accountStatus, suspensionReason = '' } = req.body || {};

		if (!['active', 'suspended'].includes(accountStatus)) {
			return res.status(400).json({
				success: false,
				message: 'Account status must be either active or suspended',
			});
		}

		const targetUser = await ensureManagedUser(req.params.userId);
		if (!targetUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		if (targetUser.isDeleted) {
			return res.status(400).json({
				success: false,
				message: 'Deleted users cannot be updated',
			});
		}

		if (String(targetUser._id) === String(req.currentUser._id) && accountStatus === 'suspended') {
			return res.status(400).json({
				success: false,
				message: 'You cannot suspend your own account',
			});
		}

		if (targetUser.accountStatus === accountStatus) {
			return res.json({
				success: true,
				message: 'Account status unchanged',
				user: serializeAdminUser(targetUser),
			});
		}

		if (targetUser.role === 'admin' && targetUser.accountStatus === 'active' && accountStatus === 'suspended') {
			const otherActiveAdmins = await countActiveAdminsExcludingUser(targetUser._id);
			if (otherActiveAdmins <= 0) {
				return res.status(400).json({
					success: false,
					message: 'You cannot suspend the last active admin',
				});
			}
		}

		const previousStatus = targetUser.accountStatus || 'active';
		targetUser.accountStatus = accountStatus;
		targetUser.suspendedAt = accountStatus === 'suspended' ? new Date() : null;
		targetUser.suspensionReason = accountStatus === 'suspended'
			? String(suspensionReason || '').trim()
			: '';
		await targetUser.save();

		await logAdminAction({
			req,
			action: accountStatus === 'suspended' ? 'user.suspended' : 'user.reactivated',
			targetUser,
			details: {
				fromStatus: previousStatus,
				toStatus: accountStatus,
				suspensionReason: targetUser.suspensionReason,
			},
		});

		res.json({
			success: true,
			message:
				accountStatus === 'suspended'
					? 'User suspended successfully'
					: 'User reactivated successfully',
			user: serializeAdminUser(targetUser),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update user status',
		});
	}
});

router.patch('/users/:userId/restore', async (req, res) => {
	try {
		const targetUser = await ensureManagedUser(req.params.userId);
		if (!targetUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		if (!targetUser.isDeleted) {
			return res.json({
				success: true,
				message: 'User is already active',
				user: serializeAdminUser(targetUser),
			});
		}

		const previousStatus = getDisplayStatus(targetUser);
		const previousDeletionReason = targetUser.deletionReason || '';

		targetUser.isDeleted = false;
		targetUser.deletedAt = null;
		targetUser.deletionReason = '';
		targetUser.accountStatus = 'active';
		targetUser.suspendedAt = null;
		targetUser.suspensionReason = '';
		await targetUser.save();

		await logAdminAction({
			req,
			action: 'user.restored',
			targetUser,
			details: {
				fromStatus: previousStatus,
				toStatus: 'active',
				previousDeletionReason,
			},
		});

		res.json({
			success: true,
			message: 'User restored successfully',
			user: serializeAdminUser(targetUser),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to restore user',
		});
	}
});

router.delete('/users/:userId', async (req, res) => {
	try {
		const { deletionReason = '', confirmEmail = '' } = req.body || {};
		const targetUser = await ensureManagedUser(req.params.userId);

		if (!targetUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		if (targetUser.isDeleted) {
			return res.status(400).json({
				success: false,
				message: 'User has already been deleted',
			});
		}

		if (String(targetUser._id) === String(req.currentUser._id)) {
			return res.status(400).json({
				success: false,
				message: 'You cannot delete your own admin account',
			});
		}

		if (targetUser.role === 'admin') {
			const otherAdmins = await countAdminsExcludingUser(targetUser._id);
			if (otherAdmins <= 0) {
				return res.status(400).json({
					success: false,
					message: 'You cannot delete the last admin account',
				});
			}
		}

		if (String(confirmEmail || '').trim().toLowerCase() !== String(targetUser.email || '').trim().toLowerCase()) {
			return res.status(400).json({
				success: false,
				message: 'Deletion confirmation email does not match the target user',
			});
		}

		targetUser.isDeleted = true;
		targetUser.deletedAt = new Date();
		targetUser.deletionReason = String(deletionReason || '').trim();
		targetUser.accountStatus = 'suspended';
		targetUser.suspendedAt = targetUser.suspendedAt || new Date();
		await targetUser.save();

		await logAdminAction({
			req,
			action: 'user.soft_deleted',
			targetUser,
			details: {
				deletionReason: targetUser.deletionReason,
				deletedUserId: targetUser._id.toString(),
			},
		});

		res.json({
			success: true,
			message: 'User soft-deleted successfully',
			user: serializeAdminUser(targetUser),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete user',
		});
	}
});

export default router;
