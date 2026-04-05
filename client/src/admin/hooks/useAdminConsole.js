import { useEffect, useMemo, useState } from 'react'
import {
	API_BASE_URL,
	PERMISSION_DEFINITIONS,
	TOKEN_STORAGE_KEY,
	defaultAuditQuery,
	defaultLoginForm,
	defaultRolePermissions,
	defaultUserQuery,
	emptyRolePermissions,
	fullAdminPermissions,
} from '../constants.js'
import {
	buildPermissionOverrideDraft,
	buildPermissionOverridePayload,
	buildRolePermissionState,
	defaultAvailableRoles,
	defaultProtectedRoles,
	getAdminInitialState,
} from '../helpers.js'
import {
	buildAuditQueryString,
	buildUserQueryString,
	createMessage,
	fetchJson,
} from '../utils.js'
import useAdminSelectStyles from './useAdminSelectStyles.js'

export default function useAdminConsole() {
	const initialState = getAdminInitialState()
	const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '')
	const [adminUser, setAdminUser] = useState(null)
	const [overview, setOverview] = useState(initialState.overview)
	const [users, setUsers] = useState(initialState.users)
	const [usersPagination, setUsersPagination] = useState(initialState.usersPagination)
	const [auditLogs, setAuditLogs] = useState(initialState.auditLogs)
	const [auditPagination, setAuditPagination] = useState(initialState.auditPagination)
	const [draftRoles, setDraftRoles] = useState({})
	const [loginForm, setLoginForm] = useState(defaultLoginForm)
	const [userQuery, setUserQuery] = useState(defaultUserQuery)
	const [auditQuery, setAuditQuery] = useState(defaultAuditQuery)
	const [selectedUserId, setSelectedUserId] = useState('')
	const [selectedUserDetail, setSelectedUserDetail] = useState(initialState.selectedUserDetail)
	const [activeTab, setActiveTab] = useState('dashboard')
	const [availableRoles, setAvailableRoles] = useState(initialState.availableRoles)
	const [protectedRoles, setProtectedRoles] = useState(initialState.protectedRoles)
	const [rolePermissions, setRolePermissions] = useState(initialState.rolePermissions)
	const [newRoleName, setNewRoleName] = useState('')
	const [permissionOverrideDrafts, setPermissionOverrideDrafts] = useState({})
	const [isBootstrapping, setIsBootstrapping] = useState(true)
	const [isLoggingIn, setIsLoggingIn] = useState(false)
	const [isGoogleLoggingIn, setIsGoogleLoggingIn] = useState(false)
	const [isRefreshingSummary, setIsRefreshingSummary] = useState(false)
	const [isUsersLoading, setIsUsersLoading] = useState(false)
	const [isAuditLoading, setIsAuditLoading] = useState(false)
	const [isDetailLoading, setIsDetailLoading] = useState(false)
	const [isExportingBackup, setIsExportingBackup] = useState(false)
	const [isRestoringBackup, setIsRestoringBackup] = useState(false)
	const [isClearingAuditLogs, setIsClearingAuditLogs] = useState(false)
	const [savingPermissionRole, setSavingPermissionRole] = useState('')
	const [isCreatingRole, setIsCreatingRole] = useState(false)
	const [deletingRole, setDeletingRole] = useState('')
	const [busyActionKey, setBusyActionKey] = useState('')
	const [message, setMessage] = useState(null)

	const adminSelectStyles = useAdminSelectStyles()
	const roleScope = activeTab === 'admins' ? 'admin' : 'all'
	const currentUserRole = adminUser?.role || ''
	const currentUserPermissions =
		adminUser?.permissions ||
		(currentUserRole === 'admin'
			? fullAdminPermissions
			: rolePermissions[currentUserRole] || defaultRolePermissions[currentUserRole] || defaultRolePermissions.user)
	const canViewDashboard = Boolean(currentUserPermissions.viewDashboard)
	const canViewUsers = Boolean(currentUserPermissions.viewUsers)
	const canViewAuditLogs = Boolean(currentUserPermissions.viewAuditLogs)
	const canClearAuditLogs = Boolean(currentUserPermissions.clearAuditLogs)
	const canViewAccessMap = Boolean(currentUserPermissions.viewAccessMap)
	const canManageRoles = Boolean(currentUserPermissions.manageUserRoles)
	const canSuspendUsers = Boolean(currentUserPermissions.suspendUsers)
	const canRestoreUsers = Boolean(currentUserPermissions.restoreUsers)
	const canSoftDeleteUsers = Boolean(currentUserPermissions.softDeleteUsers)
	const canPermanentDeleteUsers = Boolean(currentUserPermissions.permanentDeleteUsers)
	const canExportBackup = Boolean(currentUserPermissions.exportBackup)
	const canRestoreBackup = Boolean(currentUserPermissions.restoreBackup)
	const canManageRolePermissions = currentUserRole === 'admin'
	const canAccessDashboardTab =
		canViewDashboard || canExportBackup || canRestoreBackup || canManageRolePermissions
	const visibleTabs = [
		canAccessDashboardTab ? { id: 'dashboard', label: 'Dashboard' } : null,
		canManageRolePermissions ? { id: 'permissions', label: 'Permissions' } : null,
		canViewUsers ? { id: 'users', label: 'Users' } : null,
		canViewUsers ? { id: 'admins', label: 'Admins' } : null,
		canViewAuditLogs || canClearAuditLogs ? { id: 'audit', label: 'Audit' } : null,
	].filter(Boolean)
	const selectedPermissionOverrideDraft = useMemo(
		() =>
			permissionOverrideDrafts[selectedUserId] ||
			buildPermissionOverrideDraft(selectedUserDetail.user?.permissionOverrides),
		[permissionOverrideDrafts, selectedUserId, selectedUserDetail.user?.permissionOverrides]
	)
	const authHeaders = useMemo(
		() => (
			token
				? {
					Authorization: `Bearer ${token}`,
					'Content-Type': 'application/json',
				}
				: { 'Content-Type': 'application/json' }
		),
		[token]
	)

	const resetSession = (nextMessage = null) => {
		localStorage.removeItem(TOKEN_STORAGE_KEY)
		setToken('')
		setAdminUser(null)
		setOverview(initialState.overview)
		setAvailableRoles(defaultAvailableRoles)
		setProtectedRoles(defaultProtectedRoles)
		setRolePermissions(initialState.rolePermissions)
		setNewRoleName('')
		setUsers(initialState.users)
		setUsersPagination(initialState.usersPagination)
		setAuditLogs(initialState.auditLogs)
		setAuditPagination(initialState.auditPagination)
		setDraftRoles({})
		setPermissionOverrideDrafts({})
		setSelectedUserId('')
		setSelectedUserDetail(initialState.selectedUserDetail)
		setActiveTab('dashboard')
		setIsClearingAuditLogs(false)
		setSavingPermissionRole('')
		setIsCreatingRole(false)
		setDeletingRole('')
		setMessage(nextMessage)
	}

	const loadSummary = async (activeToken = token, { silent = false } = {}) => {
		if (!activeToken) {
			return
		}

		if (silent) {
			setIsRefreshingSummary(true)
		}

		try {
			const headers = { Authorization: `Bearer ${activeToken}` }
			const meData = await fetchJson(`${API_BASE_URL}/api/admin/me`, { headers })
			const mePermissions =
				meData.user?.permissions ||
				(meData.user?.role === 'admin'
					? fullAdminPermissions
					: defaultRolePermissions[meData.user?.role] || defaultRolePermissions.user)
			const [overviewData, roleData, permissionData] = await Promise.all([
				mePermissions.viewDashboard
					? fetchJson(`${API_BASE_URL}/api/admin/overview`, { headers })
					: Promise.resolve(null),
				fetchJson(`${API_BASE_URL}/api/admin/roles`, { headers }),
				meData.user?.role === 'admin'
					? fetchJson(`${API_BASE_URL}/api/admin/role-permissions`, { headers })
					: Promise.resolve(null),
			])
			const nextRoles = roleData?.roles?.length
				? roleData.roles
				: defaultAvailableRoles

			setAdminUser(meData.user)
			setOverview(overviewData?.overview || initialState.overview)
			setAvailableRoles(nextRoles)
			setProtectedRoles(roleData?.protectedRoles || defaultProtectedRoles)
			setRolePermissions(
				buildRolePermissionState(
					permissionData?.roles || nextRoles,
					permissionData?.permissions || {}
				)
			)
		} catch (error) {
			resetSession(createMessage('error', error.message || 'Admin session expired'))
			throw error
		} finally {
			setIsRefreshingSummary(false)
		}
	}

	const loadUsers = async (activeToken = token, query = userQuery, role = roleScope) => {
		if (!activeToken) {
			return
		}

		setIsUsersLoading(true)

		try {
			const headers = { Authorization: `Bearer ${activeToken}` }
			const queryString = buildUserQueryString(query, role)
			const data = await fetchJson(`${API_BASE_URL}/api/admin/users?${queryString}`, { headers })

			setUsers(data.users || [])
			setUsersPagination(data.pagination || initialState.usersPagination)
			setDraftRoles(
				Object.fromEntries((data.users || []).map((user) => [user.id, user.role]))
			)
		} catch (error) {
			resetSession(createMessage('error', error.message || 'Unable to load users'))
			throw error
		} finally {
			setIsUsersLoading(false)
		}
	}

	const loadAuditLogs = async (activeToken = token, query = auditQuery) => {
		if (!activeToken) {
			return
		}

		setIsAuditLoading(true)

		try {
			const headers = { Authorization: `Bearer ${activeToken}` }
			const queryString = buildAuditQueryString(query)
			const data = await fetchJson(`${API_BASE_URL}/api/admin/audit-logs?${queryString}`, { headers })

			setAuditLogs(data.logs || [])
			setAuditPagination(data.pagination || initialState.auditPagination)
		} catch (error) {
			resetSession(createMessage('error', error.message || 'Unable to load audit logs'))
			throw error
		} finally {
			setIsAuditLoading(false)
		}
	}

	const loadUserDetail = async (userId, activeToken = token) => {
		if (!activeToken || !userId) {
			setSelectedUserDetail(initialState.selectedUserDetail)
			return
		}

		setIsDetailLoading(true)

		try {
			const headers = { Authorization: `Bearer ${activeToken}` }
			const data = await fetchJson(`${API_BASE_URL}/api/admin/users/${userId}`, { headers })
			setSelectedUserDetail({
				user: data.user,
				summary: data.summary,
				recentTrainings: data.recentTrainings || [],
				recentTemplates: data.recentTemplates || [],
				recentAuditLogs: data.recentAuditLogs || [],
			})
			if (data.user?.permissions) {
				setPermissionOverrideDrafts((current) => ({
					...current,
					[userId]: buildPermissionOverrideDraft(data.user?.permissionOverrides),
				}))
			}
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Unable to load user details'))
		} finally {
			setIsDetailLoading(false)
		}
	}

	const refreshCurrentView = async (activeToken = token) => {
		await loadSummary(activeToken, { silent: true })

		if (activeTab === 'audit' && canViewAuditLogs) {
			await loadAuditLogs(activeToken, auditQuery)
		} else if (activeTab === 'users' || activeTab === 'admins') {
			await loadUsers(activeToken, userQuery, roleScope)
		}

		if (selectedUserId) {
			await loadUserDetail(selectedUserId, activeToken)
		}
	}

	useEffect(() => {
		if (!token) {
			setIsBootstrapping(false)
			return
		}

		let mounted = true

		const initialize = async () => {
			setIsBootstrapping(true)
			try {
				await loadSummary(token)
				if (activeTab === 'audit' && canViewAuditLogs) {
					await loadAuditLogs(token, auditQuery)
				} else if (activeTab === 'users' || activeTab === 'admins') {
					await loadUsers(token, userQuery, roleScope)
				}
			} finally {
				if (mounted) {
					setIsBootstrapping(false)
				}
			}
		}

		initialize()

		return () => {
			mounted = false
		}
	}, [token])

	useEffect(() => {
		if (!token) {
			return
		}

		if (activeTab === 'users' || activeTab === 'admins') {
			loadUsers(token, userQuery, roleScope)
		}
	}, [token, activeTab, roleScope, userQuery.page, userQuery.pageSize, userQuery.search, userQuery.status, userQuery.includeDeleted])

	useEffect(() => {
		if (!token || activeTab !== 'audit' || !canViewAuditLogs) {
			return
		}

		loadAuditLogs(token, auditQuery)
	}, [token, activeTab, canViewAuditLogs, auditQuery.page, auditQuery.pageSize, auditQuery.search])

	useEffect(() => {
		if (!token || !selectedUserId) {
			setSelectedUserDetail(initialState.selectedUserDetail)
			return
		}

		loadUserDetail(selectedUserId, token)
	}, [token, selectedUserId])

	useEffect(() => {
		if (activeTab !== 'users' && activeTab !== 'admins') {
			setSelectedUserId('')
			setSelectedUserDetail(initialState.selectedUserDetail)
		}
	}, [activeTab])

	useEffect(() => {
		if (visibleTabs.length === 0) {
			return
		}

		if (!visibleTabs.some((tab) => tab.id === activeTab)) {
			setActiveTab(visibleTabs[0].id)
		}
	}, [activeTab, visibleTabs])

	const handleLoginChange = (event) => {
		const { name, value } = event.target
		setLoginForm((current) => ({
			...current,
			[name]: value,
		}))
	}

	const handleLogin = async (event) => {
		event.preventDefault()
		setIsLoggingIn(true)
		setMessage(null)

		try {
			const data = await fetchJson(`${API_BASE_URL}/api/admin/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(loginForm),
			})

			localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
			setToken(data.token)
			setAdminUser(data.user)
			setLoginForm(defaultLoginForm)
			setMessage(createMessage('success', 'Admin session started'))
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Unable to log in'))
		} finally {
			setIsLoggingIn(false)
		}
	}

	const handleGoogleLogin = async (credential) => {
		setIsGoogleLoggingIn(true)
		setMessage(null)

		try {
			const data = await fetchJson(`${API_BASE_URL}/api/admin/google`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: credential }),
			})

			localStorage.setItem(TOKEN_STORAGE_KEY, data.token)
			setToken(data.token)
			setAdminUser(data.user)
			setLoginForm(defaultLoginForm)
			setMessage(createMessage('success', 'Admin Google session started'))
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Unable to log in with Google'))
		} finally {
			setIsGoogleLoggingIn(false)
		}
	}

	const handleLogout = () => {
		resetSession(createMessage('success', 'Admin session closed'))
	}

	const handleExportBackup = async () => {
		if (!token || !canExportBackup) {
			return
		}

		setIsExportingBackup(true)
		setMessage(null)

		try {
			const response = await fetch(`${API_BASE_URL}/api/admin/system-backup`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			})
			const contentType = response.headers.get('content-type') || ''
			const data = contentType.includes('application/json')
				? await response.json()
				: { message: await response.text() }

			if (!response.ok) {
				throw new Error(data?.message || 'Unable to export backup')
			}

			const backup = data.backup || data
			const contentDisposition = response.headers.get('content-disposition') || ''
			const filenameMatch = contentDisposition.match(/filename=\"([^\"]+)\"/i)
			const filename =
				filenameMatch?.[1] ||
				`gymnotes-backup-${new Date().toISOString().replace(/[:.]/g, '-')}.json`

			const blob = new Blob([JSON.stringify(backup, null, 2)], {
				type: 'application/json',
			})
			const downloadUrl = window.URL.createObjectURL(blob)
			const link = document.createElement('a')
			link.href = downloadUrl
			link.download = filename
			document.body.appendChild(link)
			link.click()
			link.remove()
			window.URL.revokeObjectURL(downloadUrl)

			setMessage(createMessage('success', 'System backup downloaded successfully'))
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Unable to export backup'))
		} finally {
			setIsExportingBackup(false)
		}
	}

	const handleRestoreBackup = async (file) => {
		if (!token || !canRestoreBackup) {
			setMessage(createMessage('error', 'Your role cannot restore backups'))
			return false
		}

		if (!file) {
			setMessage(createMessage('error', 'Choose a backup file first'))
			return false
		}

		const confirmed = window.confirm(
			'This will replace the current database with the selected backup. Continue?'
		)

		if (!confirmed) {
			return false
		}

		setIsRestoringBackup(true)
		setMessage(null)

		try {
			const rawBackup = await file.text()
			let backup

			try {
				backup = JSON.parse(rawBackup)
			} catch {
				throw new Error('Backup file must contain valid JSON')
			}

			await fetchJson(`${API_BASE_URL}/api/admin/system-restore`, {
				method: 'POST',
				headers: authHeaders,
				body: JSON.stringify({ backup }),
			})

			try {
				await refreshCurrentView(token)
				setMessage(createMessage('success', 'System backup restored successfully'))
			} catch {
				resetSession(createMessage('success', 'Backup restored. Please log in again.'))
			}

			return true
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Unable to restore backup'))
			return false
		} finally {
			setIsRestoringBackup(false)
		}
	}

	const handlePermissionToggle = (role, key, value) => {
		setRolePermissions((current) => ({
			...current,
			[role]: {
				...(current[role] || defaultRolePermissions[role] || emptyRolePermissions),
				[key]: value,
			},
		}))
	}

	const handleSaveRolePermissions = async (role) => {
		setSavingPermissionRole(role)
		setMessage(null)

		try {
			const data = await fetchJson(`${API_BASE_URL}/api/admin/role-permissions/${role}`, {
				method: 'PUT',
				headers: authHeaders,
				body: JSON.stringify({
					permissions: rolePermissions[role] || defaultRolePermissions[role] || emptyRolePermissions,
				}),
			})

			setRolePermissions((current) => ({
				...current,
				[role]: {
					...(defaultRolePermissions[role] || emptyRolePermissions),
					...(data.permissions || current[role] || {}),
				},
			}))
			setMessage(createMessage('success', data.message || `${role} permissions updated`))
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Unable to save role permissions'))
		} finally {
			setSavingPermissionRole('')
		}
	}

	const handleCreateRole = async () => {
		const nextRole = newRoleName.trim().toLowerCase()
		if (!nextRole) {
			return
		}

		setIsCreatingRole(true)
		setMessage(null)

		try {
			const data = await fetchJson(`${API_BASE_URL}/api/admin/roles`, {
				method: 'POST',
				headers: authHeaders,
				body: JSON.stringify({ role: nextRole }),
			})

			setNewRoleName('')
			await refreshCurrentView(token)
			setMessage(createMessage('success', data.message || `Role "${nextRole}" created`))
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Unable to create role'))
		} finally {
			setIsCreatingRole(false)
		}
	}

	const handleDeleteRole = async (role) => {
		const confirmation = window.prompt(
			`Type the exact role name to delete it:\n${role}`,
			''
		)

		if (confirmation === null) {
			return
		}

		if (confirmation.trim().toLowerCase() !== role) {
			setMessage(createMessage('error', 'Role name confirmation did not match'))
			return
		}

		setDeletingRole(role)
		setMessage(null)

		try {
			const data = await fetchJson(`${API_BASE_URL}/api/admin/roles/${role}`, {
				method: 'DELETE',
				headers: authHeaders,
			})

			await refreshCurrentView(token)
			setMessage(createMessage('success', data.message || `Role "${role}" deleted`))
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Unable to delete role'))
		} finally {
			setDeletingRole('')
		}
	}

	const handleRoleDraftChange = (userId, role) => {
		setDraftRoles((current) => ({
			...current,
			[userId]: role,
		}))
	}

	const handlePermissionOverrideChange = (permissionKey, value) => {
		if (!selectedUserId) {
			return
		}

		setPermissionOverrideDrafts((current) => ({
			...current,
			[selectedUserId]: {
				...(current[selectedUserId] || buildPermissionOverrideDraft(selectedUserDetail.user?.permissionOverrides)),
				[permissionKey]: value,
			},
		}))
	}

	const handlePermissionOverrideReset = () => {
		if (!selectedUserId) {
			return
		}

		setPermissionOverrideDrafts((current) => ({
			...current,
			[selectedUserId]: buildPermissionOverrideDraft(),
		}))
	}

	const runUserAction = async ({ actionKey, request, successMessage }) => {
		setBusyActionKey(actionKey)
		setMessage(null)

		try {
			const data = await request()
			await refreshCurrentView(token)
			setMessage(createMessage('success', data.message || successMessage))
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Action failed'))
		} finally {
			setBusyActionKey('')
		}
	}

	const handlePermissionOverrideSave = async () => {
		if (!selectedUserId || !selectedUserDetail.user) {
			return
		}

		const draft =
			permissionOverrideDrafts[selectedUserId] ||
			buildPermissionOverrideDraft(selectedUserDetail.user.permissionOverrides)

		await runUserAction({
			actionKey: `permissions:${selectedUserId}`,
			request: async () => {
				const data = await fetchJson(`${API_BASE_URL}/api/admin/users/${selectedUserId}/permissions`, {
					method: 'PATCH',
					headers: authHeaders,
					body: JSON.stringify({
						permissionOverrides: buildPermissionOverridePayload(draft),
					}),
				})

				setSelectedUserDetail((current) => (
					current.user
						? {
							...current,
							user: {
								...current.user,
								...(data.user || {}),
							},
						}
						: current
				))
				setPermissionOverrideDrafts((current) => ({
					...current,
					[selectedUserId]: buildPermissionOverrideDraft(data.user?.permissionOverrides),
				}))

				return data
			},
			successMessage: 'User access updated',
		})
	}

	const handleClearAuditLogs = async () => {
		const confirmation = window.prompt(
			'Type CLEAR AUDIT LOGS to permanently remove previous audit records:',
			''
		)

		if (confirmation === null) {
			return
		}

		setIsClearingAuditLogs(true)
		setMessage(null)

		try {
			const data = await fetchJson(`${API_BASE_URL}/api/admin/audit-logs`, {
				method: 'DELETE',
				headers: authHeaders,
				body: JSON.stringify({
					confirmPhrase: confirmation.trim(),
				}),
			})

			await refreshCurrentView(token)
			setMessage(createMessage('success', data.message || 'Audit log cleared'))
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Unable to clear audit logs'))
		} finally {
			setIsClearingAuditLogs(false)
		}
	}

	const handleUserQueryChange = (field, value) => {
		setUserQuery((current) => ({
			...current,
			[field]: value,
			page: field === 'page' ? value : 1,
		}))
	}

	const handleAuditQueryChange = (field, value) => {
		setAuditQuery((current) => ({
			...current,
			[field]: value,
			page: field === 'page' ? value : 1,
		}))
	}

	const handleRoleSave = async (user) => {
		const nextRole = draftRoles[user.id] || user.role
		if (nextRole === user.role) {
			return
		}

		await runUserAction({
			actionKey: `role:${user.id}`,
			request: () => fetchJson(`${API_BASE_URL}/api/admin/users/${user.id}/role`, {
				method: 'PATCH',
				headers: authHeaders,
				body: JSON.stringify({ role: nextRole }),
			}),
			successMessage: 'Role updated',
		})
	}

	const handleStatusToggle = async (user) => {
		const nextStatus = user.accountStatus === 'active' ? 'suspended' : 'active'
		let suspensionReason = ''

		if (nextStatus === 'suspended') {
			const response = window.prompt(
				`Optional suspension reason for ${user.email}:`,
				user.suspensionReason || ''
			)

			if (response === null) {
				return
			}

			suspensionReason = response.trim()
		}

		await runUserAction({
			actionKey: `status:${user.id}`,
			request: () => fetchJson(`${API_BASE_URL}/api/admin/users/${user.id}/status`, {
				method: 'PATCH',
				headers: authHeaders,
				body: JSON.stringify({
					accountStatus: nextStatus,
					suspensionReason,
				}),
			}),
			successMessage: nextStatus === 'suspended' ? 'User suspended' : 'User reactivated',
		})
	}

	const handleDeleteUser = async (user) => {
		const confirmation = window.prompt(
			`Type the exact email to soft-delete this user:\n${user.email}`,
			''
		)

		if (confirmation === null) {
			return
		}

		const deletionReason = window.prompt(
			`Optional deletion reason for ${user.email}:`,
			user.deletionReason || ''
		)

		if (deletionReason === null) {
			return
		}

		await runUserAction({
			actionKey: `delete:${user.id}`,
			request: () => fetchJson(`${API_BASE_URL}/api/admin/users/${user.id}`, {
				method: 'DELETE',
				headers: authHeaders,
				body: JSON.stringify({
					confirmEmail: confirmation.trim(),
					deletionReason: deletionReason.trim(),
				}),
			}),
			successMessage: 'User soft deleted',
		})
	}

	const handleRestoreUser = async (user) => {
		await runUserAction({
			actionKey: `restore:${user.id}`,
			request: () => fetchJson(`${API_BASE_URL}/api/admin/users/${user.id}/restore`, {
				method: 'PATCH',
				headers: authHeaders,
			}),
			successMessage: 'User restored',
		})
	}

	const handlePermanentDeleteUser = async (user) => {
		const confirmation = window.prompt(
			`Type the exact email to permanently delete this user and all related data:\n${user.email}`,
			''
		)

		if (confirmation === null) {
			return
		}

		const confirmPhrase = window.prompt(
			'Type PERMANENT DELETE to confirm irreversible removal:',
			''
		)

		if (confirmPhrase === null) {
			return
		}

		await runUserAction({
			actionKey: `permanent-delete:${user.id}`,
			request: async () => {
				const data = await fetchJson(`${API_BASE_URL}/api/admin/users/${user.id}/permanent`, {
					method: 'DELETE',
					headers: authHeaders,
					body: JSON.stringify({
						confirmEmail: confirmation.trim(),
						confirmPhrase: confirmPhrase.trim(),
					}),
				})

				if (selectedUserId === user.id) {
					setSelectedUserId('')
					setSelectedUserDetail(initialState.selectedUserDetail)
				}

				return data
			},
			successMessage: 'User permanently deleted',
		})
	}

	return {
		token,
		adminUser,
		overview,
		users,
		usersPagination,
		auditLogs,
		auditPagination,
		draftRoles,
		loginForm,
		userQuery,
		auditQuery,
		selectedUserId,
		selectedUserDetail,
		activeTab,
		availableRoles,
		protectedRoles,
		rolePermissions,
		newRoleName,
		isBootstrapping,
		isLoggingIn,
		isGoogleLoggingIn,
		isRefreshingSummary,
		isUsersLoading,
		isAuditLoading,
		isDetailLoading,
		isExportingBackup,
		isRestoringBackup,
		isClearingAuditLogs,
		savingPermissionRole,
		isCreatingRole,
		deletingRole,
		busyActionKey,
		message,
		currentUserRole,
		adminSelectStyles,
		visibleTabs,
		selectedPermissionOverrideDraft,
		canViewDashboard,
		canViewUsers,
		canViewAuditLogs,
		canClearAuditLogs,
		canViewAccessMap,
		canManageRoles,
		canSuspendUsers,
		canRestoreUsers,
		canSoftDeleteUsers,
		canPermanentDeleteUsers,
		canExportBackup,
		canRestoreBackup,
		canManageUserPermissionOverrides: currentUserRole === 'admin',
		handleLoginChange,
		handleLogin,
		handleGoogleLogin,
		handleLogout,
		refreshCurrentView,
		handleExportBackup,
		handleRestoreBackup,
		handlePermissionToggle,
		handleSaveRolePermissions,
		handleCreateRole,
		handleDeleteRole,
		handleRoleDraftChange,
		handlePermissionOverrideChange,
		handlePermissionOverrideReset,
		handlePermissionOverrideSave,
		handleClearAuditLogs,
		handleUserQueryChange,
		handleAuditQueryChange,
		handleRoleSave,
		handleStatusToggle,
		handleDeleteUser,
		handleRestoreUser,
		handlePermanentDeleteUser,
		setActiveTab,
		setNewRoleName,
		setSelectedUserId,
		setMessage,
	}
}
