import {
	PERMISSION_DEFINITIONS,
	defaultRolePermissions,
	emptyRolePermissions,
	initialOverview,
	initialPagination,
	initialRolePermissions,
	initialUserDetail,
} from './constants.js'

export const defaultAvailableRoles = ['admin', ...Object.keys(defaultRolePermissions)]
export const defaultProtectedRoles = ['admin', 'user']

export const buildPermissionRecord = (source = {}, fallback = emptyRolePermissions) =>
	Object.fromEntries(
		PERMISSION_DEFINITIONS.map(({ key }) => [key, Boolean(source[key] ?? fallback[key] ?? false)])
	)

export const buildRolePermissionState = (roles = [], permissions = {}) =>
	Object.fromEntries(
		Array.from(new Set([...Object.keys(defaultRolePermissions), ...roles]))
			.filter((role) => role && role !== 'admin')
			.sort((left, right) => left.localeCompare(right))
			.map((role) => [
				role,
				buildPermissionRecord(permissions[role], defaultRolePermissions[role] || emptyRolePermissions),
			])
	)

export const buildPermissionOverrideDraft = (overrides = {}) =>
	Object.fromEntries(
		PERMISSION_DEFINITIONS.map(({ key }) => [
			key,
			overrides[key] === true ? 'allow' : overrides[key] === false ? 'deny' : 'inherit',
		])
	)

export const buildPermissionOverridePayload = (draft = {}) =>
	Object.fromEntries(
		Object.entries(draft).flatMap(([key, value]) => {
			if (value === 'allow') return [[key, true]]
			if (value === 'deny') return [[key, false]]
			return []
		})
	)

export const getAdminInitialState = () => ({
	overview: initialOverview,
	users: [],
	usersPagination: initialPagination,
	auditLogs: [],
	auditPagination: initialPagination,
	rolePermissions: initialRolePermissions,
	selectedUserDetail: initialUserDetail,
	availableRoles: defaultAvailableRoles,
	protectedRoles: defaultProtectedRoles,
})
