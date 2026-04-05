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
import AdminRolePermission from '../models/AdminRolePermission.js';
import { generateToken, verifyGoogleToken } from '../utils/jwt.js';
import { authMiddleware } from '../middleware/auth.js';
import { validateLogin } from '../middleware/validation.js';
import { logAdminAction } from '../utils/adminAudit.js';

const router = express.Router();

const MAX_PAGE_SIZE = 100;
const DEFAULT_PAGE_SIZE = 20;
const DEFAULT_AUDIT_PAGE_SIZE = 25;
const NOT_DELETED_MATCH = { $ne: true };
const ACTIVE_ACCOUNT_MATCH = { $ne: 'suspended' };
const CORE_PERMISSION_ROLES = ['user', 'trainee', 'moderator'];
const PROTECTED_ROLES = new Set(['admin', 'user']);
const PERMISSION_KEYS = [
	'viewDashboard',
	'viewUsers',
	'viewAuditLogs',
	'clearAuditLogs',
	'viewAccessMap',
	'manageUserRoles',
	'suspendUsers',
	'restoreUsers',
	'softDeleteUsers',
	'permanentDeleteUsers',
	'exportBackup',
	'restoreBackup',
];
const DEFAULT_ROLE_PERMISSIONS = {
	user: {
		viewDashboard: false,
		viewUsers: false,
		viewAuditLogs: false,
		clearAuditLogs: false,
		viewAccessMap: false,
		manageUserRoles: false,
		suspendUsers: false,
		restoreUsers: false,
		softDeleteUsers: false,
		permanentDeleteUsers: false,
		exportBackup: false,
		restoreBackup: false,
	},
	trainee: {
		viewDashboard: true,
		viewUsers: true,
		viewAuditLogs: true,
		clearAuditLogs: false,
		viewAccessMap: true,
		manageUserRoles: false,
		suspendUsers: false,
		restoreUsers: false,
		softDeleteUsers: false,
		permanentDeleteUsers: false,
		exportBackup: false,
		restoreBackup: false,
	},
	moderator: {
		viewDashboard: true,
		viewUsers: true,
		viewAuditLogs: true,
		clearAuditLogs: false,
		viewAccessMap: true,
		manageUserRoles: true,
		suspendUsers: true,
		restoreUsers: true,
		softDeleteUsers: true,
		permanentDeleteUsers: true,
		exportBackup: true,
		restoreBackup: true,
	},
};
const FULL_ADMIN_PERMISSIONS = Object.fromEntries(PERMISSION_KEYS.map((key) => [key, true]));
const BACKUP_FORMAT = 'gymnotes-backup';
const BACKUP_VERSION = 1;
const OPTIONAL_BACKUP_COLLECTION_KEYS = new Set(['adminRolePermissions']);
const BACKUP_COLLECTIONS = [
	{ key: 'users', model: User },
	{ key: 'trainingFiles', model: TrainingFile },
	{ key: 'trainingDates', model: TrainingDate },
	{ key: 'exerciseEntries', model: ExerciseEntry },
	{ key: 'templates', model: Template },
	{ key: 'exerciseUserLibraries', model: ExerciseUserLibrary },
	{ key: 'userMuscleGroups', model: UserMuscleGroup },
	{ key: 'adminAuditLogs', model: AdminAuditLog },
	{ key: 'adminRolePermissions', model: AdminRolePermission },
];
const RESTORE_DELETE_ORDER = [...BACKUP_COLLECTIONS].reverse();
const RESTORE_INSERT_ORDER = BACKUP_COLLECTIONS;
const normalizeEmail = (email) => String(email || '').trim().toLowerCase();
const normalizeRoleName = (role) => String(role || '').trim().toLowerCase();

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

const normalizeRolePermissions = (role, source = {}) => {
	const defaults = DEFAULT_ROLE_PERMISSIONS[role] || {};
	return Object.fromEntries(
		PERMISSION_KEYS.map((key) => [key, Boolean(source[key] ?? defaults[key] ?? false)])
	);
};

const normalizePermissionOverrides = (source = {}) =>
	Object.fromEntries(
		PERMISSION_KEYS.flatMap((key) => {
			if (!Object.prototype.hasOwnProperty.call(source, key)) {
				return [];
			}

			const value = source[key];
			if (value === true || value === false) {
				return [[key, value]];
			}

			return [];
		})
	);

const applyPermissionOverrides = (permissions = {}, overrides = {}) => {
	const normalizedOverrides = normalizePermissionOverrides(overrides);
	return Object.fromEntries(
		PERMISSION_KEYS.map((key) => [
			key,
			Object.prototype.hasOwnProperty.call(normalizedOverrides, key)
				? normalizedOverrides[key]
				: Boolean(permissions[key]),
		])
	);
};

const hasConsoleAccess = (permissions = {}) =>
	Boolean(
		permissions.viewDashboard ||
		permissions.viewUsers ||
		permissions.viewAuditLogs ||
		permissions.clearAuditLogs ||
		permissions.manageUserRoles ||
		permissions.suspendUsers ||
		permissions.restoreUsers ||
		permissions.softDeleteUsers ||
		permissions.permanentDeleteUsers ||
		permissions.exportBackup ||
		permissions.restoreBackup
	);

const ensurePermissionDocuments = async () => {
	const existing = await AdminRolePermission.find({
		role: { $in: CORE_PERMISSION_ROLES },
	}).lean();
	const existingRoles = new Set(existing.map((item) => item.role));
	const missingRoles = CORE_PERMISSION_ROLES.filter((role) => !existingRoles.has(role));

	if (missingRoles.length > 0) {
		await AdminRolePermission.insertMany(
			missingRoles.map((role) => ({
				role,
				permissions: normalizeRolePermissions(role, DEFAULT_ROLE_PERMISSIONS[role]),
			})),
			{ ordered: false }
		).catch(() => null);
	}

	return AdminRolePermission.find({}).lean();
};

const getRolePermissionMap = async () => {
	const docs = await ensurePermissionDocuments();
	const permissionMap = {};

	for (const doc of docs) {
		permissionMap[doc.role] = normalizeRolePermissions(doc.role, doc?.permissions || {});
	}

	for (const role of CORE_PERMISSION_ROLES) {
		if (!permissionMap[role]) {
			permissionMap[role] = normalizeRolePermissions(role, DEFAULT_ROLE_PERMISSIONS[role] || {});
		}
	}

	return permissionMap;
};

const getPermissionsForRole = (role, permissionMap = {}) => {
	if (role === 'admin') {
		return { ...FULL_ADMIN_PERMISSIONS };
	}

	return normalizeRolePermissions(role, permissionMap[role] || DEFAULT_ROLE_PERMISSIONS[role] || {});
};

const getEffectivePermissionsForUser = (user, permissionMap = {}) =>
	user?.role === 'admin'
		? { ...FULL_ADMIN_PERMISSIONS }
		: applyPermissionOverrides(
			getPermissionsForRole(user?.role || 'user', permissionMap),
			user?.permissionOverrides || {}
		);

const getAvailableRoleList = (permissionMap = {}) => {
	const roles = ['admin', ...Object.keys(permissionMap)];
	return Array.from(new Set(roles)).sort((left, right) => {
		if (left === 'admin') return -1;
		if (right === 'admin') return 1;
		return left.localeCompare(right);
	});
};

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
			if (OPTIONAL_BACKUP_COLLECTION_KEYS.has(key)) {
				collections[key] = [];
				continue;
			}

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

const serializeAdminUser = (user, extra = {}) => ({
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
	...extra,
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

	if (role) {
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

const ensureStaffConsoleAccess = (user, permissions, res) => {
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

	if (!hasConsoleAccess(permissions)) {
		res.status(403).json({
			success: false,
			message: 'Admin panel access is disabled for this role',
		});
		return false;
	}

	return true;
};

const ensureRoutePermission = (req, res, permissionKey) => {
	if (req.currentUser?.role === 'admin') {
		return true;
	}

	if (req.rolePermissions?.[permissionKey]) {
		return true;
	}

	res.status(403).json({
		success: false,
		message: 'This action is disabled for your role',
	});
	return false;
};

const ensureAdminOnlyAccess = (req, res) => {
	if (req.currentUser?.role === 'admin') {
		return true;
	}

	res.status(403).json({
		success: false,
		message: 'Only admins can manage role permissions',
	});
	return false;
};

const attachConsolePermissions = async (req, res, next) => {
	try {
		const permissionMap = await getRolePermissionMap();
		req.permissionMap = permissionMap;
		req.rolePermissions = getEffectivePermissionsForUser(req.currentUser, permissionMap);
		next();
	} catch (error) {
		res.status(403).json({
			success: false,
			message: 'Failed to load role permissions',
		});
	}
};

router.post('/login', validateLogin, async (req, res) => {
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

		let user = null;

		for (const candidate of users) {
			const isPasswordValid = await candidate.comparePassword(password);
			if (isPasswordValid) {
				user = candidate;
				break;
			}
		}

		if (!user) {
			return res.status(401).json({
				success: false,
				message: 'Invalid credentials',
			});
		}

		const permissionMap = await getRolePermissionMap();
		const permissions = getEffectivePermissionsForUser(user, permissionMap);

		if (!ensureStaffConsoleAccess(user, permissions, res)) return;

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
			message: 'Staff logged in successfully',
			token,
			user: serializeAdminUser(user, { permissions }),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Server error during admin login',
		});
	}
});

router.post('/google', async (req, res) => {
	try {
		const { token } = req.body || {};
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
		let user = await User.findOne({ googleId: googleProfile.googleId }).select('+password');

		if (!user) {
			const usersWithEmail = await User.find({ email: normalizedGoogleEmail })
				.select('+password')
				.sort({ createdAt: 1, _id: 1 });
			if (usersWithEmail.length > 0) {
				user =
					usersWithEmail.find((candidate) => candidate.role === 'admin') ||
					usersWithEmail.find((candidate) => candidate.role === 'moderator') ||
					usersWithEmail.find((candidate) => candidate.role === 'trainee') ||
					usersWithEmail[0];
			}
		}

		if (!user) {
			return res.status(403).json({
				success: false,
				message: 'No staff account is linked to this Google email',
			});
		}

		const permissionMap = await getRolePermissionMap();
		const permissions = getEffectivePermissionsForUser(user, permissionMap);

		if (!ensureStaffConsoleAccess(user, permissions, res)) return;

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

		const authToken = generateToken(user);
		req.currentUser = user;
		await logAdminAction({
			req,
			action: 'admin.login_google',
			targetUser: user,
			details: { result: 'success' },
		});

		res.json({
			success: true,
			message: 'Staff logged in with Google successfully',
			token: authToken,
			user: serializeAdminUser(user, { permissions }),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Server error during admin Google login',
		});
	}
});

router.use(authMiddleware, attachConsolePermissions, (req, res, next) => {
	if (!ensureStaffConsoleAccess(req.currentUser, req.rolePermissions, res)) {
		return;
	}

	next();
});

router.get('/me', async (req, res) => {
	res.json({
		success: true,
		user: serializeAdminUser(req.currentUser, {
			permissions: req.rolePermissions,
		}),
	});
});

router.get('/role-permissions', async (req, res) => {
	if (!ensureAdminOnlyAccess(req, res)) return;

	try {
		const permissionMap = req.permissionMap || await getRolePermissionMap();
		const roles = getAvailableRoleList(permissionMap).filter((role) => role !== 'admin');
		res.json({
			success: true,
			permissions: permissionMap,
			roles,
			protectedRoles: Array.from(PROTECTED_ROLES),
			keys: PERMISSION_KEYS,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to load role permissions',
		});
	}
});

router.get('/roles', async (req, res) => {
	try {
		const permissionMap = req.permissionMap || await getRolePermissionMap();
		res.json({
			success: true,
			roles: getAvailableRoleList(permissionMap),
			protectedRoles: Array.from(PROTECTED_ROLES),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to load roles',
		});
	}
});

router.post('/roles', async (req, res) => {
	if (!ensureAdminOnlyAccess(req, res)) return;

	try {
		const role = normalizeRoleName(req.body?.role);

		if (!role) {
			return res.status(400).json({
				success: false,
				message: 'Role name is required',
			});
		}

		if (!/^[a-z0-9_-]{3,32}$/.test(role)) {
			return res.status(400).json({
				success: false,
				message: 'Role name must be 3-32 characters using lowercase letters, numbers, dash, or underscore',
			});
		}

		if (role === 'admin') {
			return res.status(400).json({
				success: false,
				message: 'The admin role is built in and cannot be created manually',
			});
		}

		const existingRole = await AdminRolePermission.findOne({ role }).lean();
		if (existingRole) {
			return res.status(400).json({
				success: false,
				message: 'Role already exists',
			});
		}

		const permissions = normalizeRolePermissions(role, DEFAULT_ROLE_PERMISSIONS[role] || {});
		await AdminRolePermission.create({ role, permissions });

		await logAdminAction({
			req,
			action: 'role.created',
			targetUser: req.currentUser,
			details: { role },
		});

		res.status(201).json({
			success: true,
			message: `Role "${role}" created`,
			role,
			permissions,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to create role',
		});
	}
});

router.delete('/roles/:role', async (req, res) => {
	if (!ensureAdminOnlyAccess(req, res)) return;

	try {
		const role = normalizeRoleName(req.params.role);

		if (!role || role === 'admin') {
			return res.status(400).json({
				success: false,
				message: 'The admin role cannot be deleted',
			});
		}

		if (PROTECTED_ROLES.has(role)) {
			return res.status(400).json({
				success: false,
				message: `The "${role}" role is protected and cannot be deleted`,
			});
		}

		const assignedUsers = await User.countDocuments({ role });
		if (assignedUsers > 0) {
			return res.status(400).json({
				success: false,
				message: `Cannot delete role "${role}" while ${assignedUsers} user(s) still have it`,
			});
		}

		const deleted = await AdminRolePermission.findOneAndDelete({ role }).lean();
		if (!deleted) {
			return res.status(404).json({
				success: false,
				message: 'Role not found',
			});
		}

		await logAdminAction({
			req,
			action: 'role.deleted',
			targetUser: req.currentUser,
			details: { role },
		});

		res.json({
			success: true,
			message: `Role "${role}" deleted`,
			role,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to delete role',
		});
	}
});

router.put('/role-permissions/:role', async (req, res) => {
	if (!ensureAdminOnlyAccess(req, res)) return;

	try {
		const role = normalizeRoleName(req.params.role);
		if (!role || role === 'admin') {
			return res.status(400).json({
				success: false,
				message: 'Admin permissions are fixed and cannot be edited here',
			});
		}

		const normalizedPermissions = normalizeRolePermissions(role, req.body?.permissions || {});
		const doc = await AdminRolePermission.findOneAndUpdate(
			{ role },
			{ $set: { permissions: normalizedPermissions } },
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		).lean();

		await logAdminAction({
			req,
			action: 'role_permissions.updated',
			targetUser: req.currentUser,
			details: {
				role,
				permissions: normalizedPermissions,
			},
		});

		res.json({
			success: true,
			message: `${role} permissions updated`,
			role,
			permissions: normalizeRolePermissions(role, doc?.permissions || normalizedPermissions),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update role permissions',
		});
	}
});

router.get('/overview', async (req, res) => {
	try {
		if (!ensureRoutePermission(req, res, 'viewDashboard')) return;

		const [
			totalUsers,
			totalDeletedUsers,
			totalAdmins,
			totalModerators,
			totalTrainees,
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
			User.countDocuments({ role: 'moderator', isDeleted: NOT_DELETED_MATCH }),
			User.countDocuments({ role: 'trainee', isDeleted: NOT_DELETED_MATCH }),
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
				totalModerators,
				totalTrainees,
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
		if (!ensureRoutePermission(req, res, 'viewUsers')) return;

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
		if (!ensureRoutePermission(req, res, 'viewUsers')) return;

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
			user: serializeAdminUser(targetUser, {
				...(req.rolePermissions?.viewAccessMap
					? {
						permissions: getEffectivePermissionsForUser(targetUser, req.permissionMap),
						permissionOverrides: normalizePermissionOverrides(targetUser.permissionOverrides || {}),
					}
					: {}),
			}),
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

router.patch('/users/:userId/permissions', async (req, res) => {
	if (!ensureAdminOnlyAccess(req, res)) return;

	try {
		const targetUser = await ensureManagedUser(req.params.userId);
		if (!targetUser) {
			return res.status(404).json({
				success: false,
				message: 'User not found',
			});
		}

		if (targetUser.role === 'admin') {
			return res.status(400).json({
				success: false,
				message: 'Admin account permissions are fixed and do not support overrides',
			});
		}

		const permissionMap = req.permissionMap || await getRolePermissionMap();
		const overrides = normalizePermissionOverrides(req.body?.permissionOverrides || {});
		targetUser.permissionOverrides = overrides;
		await targetUser.save();

		const effectivePermissions = getEffectivePermissionsForUser(targetUser, permissionMap);

		await logAdminAction({
			req,
			action: 'user.permission_overrides_updated',
			targetUser,
			details: {
				role: targetUser.role,
				permissionOverrides: overrides,
			},
		});

		res.json({
			success: true,
			message: 'User permission overrides updated',
			user: serializeAdminUser(targetUser, {
				permissions: effectivePermissions,
				permissionOverrides: overrides,
			}),
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to update user permission overrides',
		});
	}
});

router.get('/audit-logs', async (req, res) => {
	try {
		if (!ensureRoutePermission(req, res, 'viewAuditLogs')) return;

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
		if (!ensureRoutePermission(req, res, 'exportBackup')) return;

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
		if (!ensureRoutePermission(req, res, 'restoreBackup')) return;

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

router.delete('/audit-logs', async (req, res) => {
	try {
		if (!ensureRoutePermission(req, res, 'clearAuditLogs')) return;

		const confirmation = String(req.body?.confirmPhrase || '').trim();
		if (confirmation !== 'CLEAR AUDIT LOGS') {
			return res.status(400).json({
				success: false,
				message: 'Type CLEAR AUDIT LOGS to confirm',
			});
		}

		const { deletedCount = 0 } = await AdminAuditLog.deleteMany({});

		await logAdminAction({
			req,
			action: 'audit_logs.cleared',
			targetUser: req.currentUser,
			details: {
				deletedCount,
			},
		});

		res.json({
			success: true,
			message: `Audit log cleared (${deletedCount} records removed)`,
			deletedCount,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to clear audit log',
		});
	}
});

router.patch('/users/:userId/role', async (req, res) => {
	try {
		if (!ensureRoutePermission(req, res, 'manageUserRoles')) return;

		const role = normalizeRoleName(req.body?.role);

		const permissionMap = req.permissionMap || await getRolePermissionMap();
		const availableRoles = new Set(getAvailableRoleList(permissionMap));

		if (!availableRoles.has(role)) {
			return res.status(400).json({
				success: false,
				message: `Role must be one of: ${Array.from(availableRoles).join(', ')}`,
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

		if (req.currentUser.role === 'moderator') {
			if (targetUser.role === 'admin') {
				return res.status(403).json({
					success: false,
					message: 'Moderators cannot manage admin accounts',
				});
			}

			if (role === 'admin') {
				return res.status(403).json({
					success: false,
					message: 'Moderators cannot grant the admin role',
				});
			}
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
		if (!ensureRoutePermission(req, res, 'suspendUsers')) return;

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

		if (req.currentUser.role === 'moderator' && targetUser.role === 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Moderators cannot manage admin accounts',
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
		if (!ensureRoutePermission(req, res, 'restoreUsers')) return;

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

		if (req.currentUser.role === 'moderator' && targetUser.role === 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Moderators cannot manage admin accounts',
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
		if (!ensureRoutePermission(req, res, 'softDeleteUsers')) return;

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

		if (req.currentUser.role === 'moderator' && targetUser.role === 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Moderators cannot manage admin accounts',
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

router.delete('/users/:userId/permanent', async (req, res) => {
	try {
		if (!ensureRoutePermission(req, res, 'permanentDeleteUsers')) return;

		const { confirmEmail = '', confirmPhrase = '' } = req.body || {};
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
				message: 'You cannot permanently delete your own admin account',
			});
		}

		if (!targetUser.isDeleted) {
			return res.status(400).json({
				success: false,
				message: 'Soft delete the user before permanent deletion',
			});
		}

		if (req.currentUser.role === 'moderator' && targetUser.role === 'admin') {
			return res.status(403).json({
				success: false,
				message: 'Moderators cannot manage admin accounts',
			});
		}

		if (targetUser.role === 'admin') {
			const otherAdmins = await countAdminsExcludingUser(targetUser._id);
			if (otherAdmins <= 0) {
				return res.status(400).json({
					success: false,
					message: 'You cannot permanently delete the last admin account',
				});
			}
		}

		if (String(confirmEmail || '').trim().toLowerCase() !== String(targetUser.email || '').trim().toLowerCase()) {
			return res.status(400).json({
				success: false,
				message: 'Permanent deletion confirmation email does not match the target user',
			});
		}

		if (String(confirmPhrase || '').trim() !== 'PERMANENT DELETE') {
			return res.status(400).json({
				success: false,
				message: 'Permanent deletion requires the exact confirmation phrase',
			});
		}

		const targetSnapshot = serializeAdminUser(targetUser);
		const counts = {
			trainingFiles: await TrainingFile.countDocuments({ userId: targetUser._id }),
			trainingDates: await TrainingDate.countDocuments({ userId: targetUser._id }),
			exerciseEntries: await ExerciseEntry.countDocuments({ userId: targetUser._id }),
			templates: await Template.countDocuments({ userId: targetUser._id }),
			exerciseUserLibraries: await ExerciseUserLibrary.countDocuments({ userId: targetUser._id }),
			userMuscleGroups: await UserMuscleGroup.countDocuments({ userId: targetUser._id }),
		};

		await Promise.all([
			TrainingFile.deleteMany({ userId: targetUser._id }),
			TrainingDate.deleteMany({ userId: targetUser._id }),
			ExerciseEntry.deleteMany({ userId: targetUser._id }),
			Template.deleteMany({ userId: targetUser._id }),
			ExerciseUserLibrary.deleteMany({ userId: targetUser._id }),
			UserMuscleGroup.deleteMany({ userId: targetUser._id }),
		]);

		await User.deleteOne({ _id: targetUser._id });

		await logAdminAction({
			req,
			action: 'user.permanently_deleted',
			targetUser: targetUser,
			details: {
				deletedUserId: targetSnapshot.id?.toString?.() || String(targetUser._id),
				email: targetSnapshot.email,
				counts,
			},
		});

		res.json({
			success: true,
			message: 'User permanently deleted',
			user: targetSnapshot,
			counts,
		});
	} catch (error) {
		res.status(500).json({
			success: false,
			message: 'Failed to permanently delete user',
		});
	}
});

export default router;
