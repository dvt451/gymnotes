export const API_BASE_URL = import.meta.env.VITE_API_URL || ''
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
export const TOKEN_STORAGE_KEY = 'gymnotes_admin_token'
export const PERMISSION_DEFINITIONS = [
	{ key: 'viewDashboard', label: 'View dashboard' },
	{ key: 'viewUsers', label: 'View users and admins' },
	{ key: 'viewAuditLogs', label: 'View audit log' },
	{ key: 'clearAuditLogs', label: 'Clear audit log' },
	{ key: 'viewAccessMap', label: 'See access map' },
	{ key: 'manageUserRoles', label: 'Change roles' },
	{ key: 'suspendUsers', label: 'Suspend and reactivate' },
	{ key: 'restoreUsers', label: 'Restore deleted users' },
	{ key: 'softDeleteUsers', label: 'Soft delete users' },
	{ key: 'permanentDeleteUsers', label: 'Permanent delete users' },
	{ key: 'exportBackup', label: 'Download backup' },
	{ key: 'restoreBackup', label: 'Restore backup' },
]

export const emptyRolePermissions = Object.fromEntries(
	PERMISSION_DEFINITIONS.map(({ key }) => [key, false])
)

export const defaultRolePermissions = {
	user: {
		...emptyRolePermissions,
	},
	trainee: {
		...emptyRolePermissions,
		viewDashboard: true,
		viewUsers: true,
		viewAuditLogs: true,
		viewAccessMap: true,
	},
	moderator: {
		...emptyRolePermissions,
		viewDashboard: true,
		viewUsers: true,
		viewAuditLogs: true,
		viewAccessMap: true,
		manageUserRoles: true,
		suspendUsers: true,
		restoreUsers: true,
		softDeleteUsers: true,
		permanentDeleteUsers: true,
		exportBackup: true,
		restoreBackup: true,
	},
}

export const fullAdminPermissions = Object.fromEntries(
	PERMISSION_DEFINITIONS.map(({ key }) => [key, true])
)

export const initialOverview = {
	totalUsers: 0,
	totalDeletedUsers: 0,
	totalAdmins: 0,
	totalModerators: 0,
	totalTrainees: 0,
	totalSuspendedUsers: 0,
	totalActiveUsers: 0,
	totalTrainings: 0,
	totalTrainingDates: 0,
	totalExercises: 0,
	totalTemplates: 0,
	totalAuditLogs: 0,
}

export const defaultLoginForm = {
	email: '',
	password: '',
}

export const defaultUserQuery = {
	page: 1,
	pageSize: 20,
	search: '',
	status: 'all',
	includeDeleted: false,
}

export const defaultAuditQuery = {
	page: 1,
	pageSize: 25,
	search: '',
}

export const initialPagination = {
	page: 1,
	pageSize: 20,
	totalItems: 0,
	totalPages: 1,
	hasNext: false,
	hasPrev: false,
}

export const initialUserDetail = {
	user: null,
	summary: null,
	recentTrainings: [],
	recentTemplates: [],
	recentAuditLogs: [],
}

export const initialRolePermissions = { ...defaultRolePermissions }

export const actionLabels = {
	'admin.login': 'Admin login',
	'admin.login_google': 'Admin Google login',
	'audit_logs.cleared': 'Audit log cleared',
	'role.created': 'Role created',
	'role.deleted': 'Role deleted',
	'role_permissions.updated': 'Role permissions updated',
	'system.backup_exported': 'System backup exported',
	'system.backup_restored': 'System backup restored',
	'user.permission_overrides_updated': 'User permission overrides updated',
	'user.role_updated': 'Role updated',
	'user.suspended': 'User suspended',
	'user.reactivated': 'User reactivated',
	'user.soft_deleted': 'User soft deleted',
	'user.permanently_deleted': 'User permanently deleted',
	'user.restored': 'User restored',
}

export const STATUS_OPTIONS = ['all', 'active', 'suspended', 'deleted']
export const USER_PAGE_SIZE_OPTIONS = ['10', '20', '50']
export const AUDIT_PAGE_SIZE_OPTIONS = ['10', '25', '50']
