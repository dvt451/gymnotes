export const API_BASE_URL = import.meta.env.VITE_API_URL || ''
export const TOKEN_STORAGE_KEY = 'gymnotes_admin_token'

export const initialOverview = {
	totalUsers: 0,
	totalDeletedUsers: 0,
	totalAdmins: 0,
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

export const actionLabels = {
	'admin.login': 'Admin login',
	'user.role_updated': 'Role updated',
	'user.suspended': 'User suspended',
	'user.reactivated': 'User reactivated',
	'user.soft_deleted': 'User soft deleted',
	'user.restored': 'User restored',
}

export const ROLE_OPTIONS = ['user', 'admin']
export const STATUS_OPTIONS = ['all', 'active', 'suspended', 'deleted']
export const USER_PAGE_SIZE_OPTIONS = ['10', '20', '50']
export const AUDIT_PAGE_SIZE_OPTIONS = ['10', '25', '50']
