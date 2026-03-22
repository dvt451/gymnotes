import { useContext, useEffect, useMemo, useState } from 'react'
import { GlobalContext } from '../context/GlobalContext.jsx'
import AdminAuditPanel from './components/AdminAuditPanel.jsx'
import AdminDashboardPanel from './components/AdminDashboardPanel.jsx'
import AdminHeader from './components/AdminHeader.jsx'
import AdminLoginScreen from './components/AdminLoginScreen.jsx'
import AdminTabs from './components/AdminTabs.jsx'
import AdminUsersPanel from './components/AdminUsersPanel.jsx'
import {
	API_BASE_URL,
	TOKEN_STORAGE_KEY,
	defaultAuditQuery,
	defaultLoginForm,
	defaultUserQuery,
	initialOverview,
	initialPagination,
	initialUserDetail,
} from './constants.js'
import {
	buildAuditQueryString,
	buildUserQueryString,
	createMessage,
	fetchJson,
} from './utils.js'

export default function AdminApp() {
	const { setMainColor } = useContext(GlobalContext)
	const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '')
	const [adminUser, setAdminUser] = useState(null)
	const [overview, setOverview] = useState(initialOverview)
	const [users, setUsers] = useState([])
	const [usersPagination, setUsersPagination] = useState(initialPagination)
	const [auditLogs, setAuditLogs] = useState([])
	const [auditPagination, setAuditPagination] = useState(initialPagination)
	const [draftRoles, setDraftRoles] = useState({})
	const [loginForm, setLoginForm] = useState(defaultLoginForm)
	const [userQuery, setUserQuery] = useState(defaultUserQuery)
	const [auditQuery, setAuditQuery] = useState(defaultAuditQuery)
	const [selectedUserId, setSelectedUserId] = useState('')
	const [selectedUserDetail, setSelectedUserDetail] = useState(initialUserDetail)
	const [activeTab, setActiveTab] = useState('dashboard')
	const [isBootstrapping, setIsBootstrapping] = useState(true)
	const [isLoggingIn, setIsLoggingIn] = useState(false)
	const [isRefreshingSummary, setIsRefreshingSummary] = useState(false)
	const [isUsersLoading, setIsUsersLoading] = useState(false)
	const [isAuditLoading, setIsAuditLoading] = useState(false)
	const [isDetailLoading, setIsDetailLoading] = useState(false)
	const [busyActionKey, setBusyActionKey] = useState('')
	const [message, setMessage] = useState(null)

	const roleScope = activeTab === 'admins' ? 'admin' : 'all'
	const adminSelectStyles = useMemo(() => ({
		container: {
			minWidth: '140px',
		},
		containerActive: {
			zIndex: 8,
		},
		trigger: {
			minHeight: '52px',
			borderRadius: '14px',
			padding: '14px 16px',
			border: '1px solid rgba(84, 56, 24, 0.16)',
			background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.88), rgba(247, 238, 226, 0.96))',
			boxShadow: '0 10px 24px rgba(84, 56, 24, 0.08)',
			color: '#2f241b',
			fontSize: '1rem',
			fontWeight: 600,
		},
		triggerOpen: {
			background: 'linear-gradient(135deg, #b85c38, #8f3f1f)',
			border: '1px solid rgba(143, 63, 31, 0.38)',
			boxShadow: '0 16px 30px rgba(143, 63, 31, 0.26)',
			color: '#fff7f0',
		},
		triggerDisabled: {
			opacity: 0.58,
			background: 'linear-gradient(180deg, rgba(244, 238, 231, 0.92), rgba(235, 226, 215, 0.96))',
			boxShadow: 'none',
			cursor: 'not-allowed',
		},
		selectedContent: {
			gap: '12px',
		},
		selectedText: {
			fontSize: '1rem',
			letterSpacing: '0.01em',
		},
		icon: {
			color: 'inherit',
		},
		optionList: {
			marginTop: '8px',
			borderRadius: '16px',
			border: '1px solid rgba(84, 56, 24, 0.12)',
			boxShadow: '0 18px 32px rgba(47, 36, 27, 0.18)',
			background: 'rgba(252, 246, 239, 0.98)',
			backdropFilter: 'blur(14px)',
			maxHeight: '220px',
			overflow: 'hidden auto',
		},
		option: {
			border: 'none',
			borderBottom: '1px solid rgba(84, 56, 24, 0.08)',
			background: 'transparent',
			color: '#2f241b',
			padding: '14px 16px',
			fontSize: '1rem',
		},
		optionFirst: {
			borderTop: 'none',
		},
		optionNotLast: {
			borderBottom: '1px solid rgba(84, 56, 24, 0.08)',
		},
		optionActive: {
			background: 'rgba(184, 92, 56, 0.14)',
			color: '#8f3f1f',
			fontWeight: 700,
		},
	}), [])

	useEffect(() => {
		setMainColor('#b85c38')
	}, [setMainColor])

	const resetSession = (nextMessage = null) => {
		localStorage.removeItem(TOKEN_STORAGE_KEY)
		setToken('')
		setAdminUser(null)
		setOverview(initialOverview)
		setUsers([])
		setUsersPagination(initialPagination)
		setAuditLogs([])
		setAuditPagination(initialPagination)
		setDraftRoles({})
		setSelectedUserId('')
		setSelectedUserDetail(initialUserDetail)
		setActiveTab('dashboard')
		setMessage(nextMessage)
	}

	const authHeaders = useMemo(() => (
		token
			? {
				Authorization: `Bearer ${token}`,
				'Content-Type': 'application/json',
			}
			: { 'Content-Type': 'application/json' }
	), [token])

	const loadSummary = async (activeToken = token, { silent = false } = {}) => {
		if (!activeToken) {
			return
		}

		if (silent) {
			setIsRefreshingSummary(true)
		}

		try {
			const headers = { Authorization: `Bearer ${activeToken}` }
			const [meData, overviewData] = await Promise.all([
				fetchJson(`${API_BASE_URL}/api/admin/me`, { headers }),
				fetchJson(`${API_BASE_URL}/api/admin/overview`, { headers }),
			])

			setAdminUser(meData.user)
			setOverview(overviewData.overview || initialOverview)
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
			setUsersPagination(data.pagination || initialPagination)
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
			setAuditPagination(data.pagination || initialPagination)
		} catch (error) {
			resetSession(createMessage('error', error.message || 'Unable to load audit logs'))
			throw error
		} finally {
			setIsAuditLoading(false)
		}
	}

	const loadUserDetail = async (userId, activeToken = token) => {
		if (!activeToken || !userId) {
			setSelectedUserDetail(initialUserDetail)
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
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Unable to load user details'))
		} finally {
			setIsDetailLoading(false)
		}
	}

	const refreshCurrentView = async (activeToken = token) => {
		await loadSummary(activeToken, { silent: true })

		if (activeTab === 'audit') {
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
				if (activeTab === 'audit') {
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
		if (!token || activeTab !== 'audit') {
			return
		}

		loadAuditLogs(token, auditQuery)
	}, [token, activeTab, auditQuery.page, auditQuery.pageSize, auditQuery.search])

	useEffect(() => {
		if (!token || !selectedUserId) {
			setSelectedUserDetail(initialUserDetail)
			return
		}

		loadUserDetail(selectedUserId, token)
	}, [token, selectedUserId])

	useEffect(() => {
		if (activeTab !== 'users' && activeTab !== 'admins') {
			setSelectedUserId('')
			setSelectedUserDetail(initialUserDetail)
		}
	}, [activeTab])

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

	const handleLogout = () => {
		resetSession(createMessage('success', 'Admin session closed'))
	}

	const handleRoleDraftChange = (userId, role) => {
		setDraftRoles((current) => ({
			...current,
			[userId]: role,
		}))
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

	if (isBootstrapping) {
		return (
			<div className="admin-screen admin-screen-loading">
				<div className="admin-loading-panel">
					<p className="admin-eyebrow">GymNotes Admin</p>
					<h1>Loading control surface</h1>
				</div>
			</div>
		)
	}

	if (!token || !adminUser) {
		return (
			<AdminLoginScreen
				loginForm={loginForm}
				message={message}
				isLoggingIn={isLoggingIn}
				onSubmit={handleLogin}
				onChange={handleLoginChange}
			/>
		)
	}

	return (
		<div className="admin-shell">
			<AdminHeader
				adminUser={adminUser}
				isRefreshingSummary={isRefreshingSummary}
				onRefresh={() => refreshCurrentView(token)}
				onLogout={handleLogout}
			/>

			{message?.text ? (
				<div className={`admin-message admin-message-${message.type}`}>{message.text}</div>
			) : null}

			<AdminTabs activeTab={activeTab} onChange={setActiveTab} />

			<main className="admin-content">
				{activeTab === 'dashboard' ? <AdminDashboardPanel overview={overview} /> : null}

				{activeTab === 'users' || activeTab === 'admins' ? (
					<AdminUsersPanel
						activeTab={activeTab}
						userQuery={userQuery}
						adminSelectStyles={adminSelectStyles}
						isUsersLoading={isUsersLoading}
						users={users}
						adminUser={adminUser}
						draftRoles={draftRoles}
						busyActionKey={busyActionKey}
						usersPagination={usersPagination}
						selectedUserId={selectedUserId}
						selectedUserDetail={selectedUserDetail}
						isDetailLoading={isDetailLoading}
						onUserQueryChange={handleUserQueryChange}
						onRoleDraftChange={handleRoleDraftChange}
						onSelectUser={setSelectedUserId}
						onRoleSave={handleRoleSave}
						onStatusToggle={handleStatusToggle}
						onRestoreUser={handleRestoreUser}
						onDeleteUser={handleDeleteUser}
						onCloseDetail={() => setSelectedUserId('')}
					/>
				) : null}

				{activeTab === 'audit' ? (
					<AdminAuditPanel
						auditQuery={auditQuery}
						adminSelectStyles={adminSelectStyles}
						isAuditLoading={isAuditLoading}
						auditLogs={auditLogs}
						auditPagination={auditPagination}
						onAuditQueryChange={handleAuditQueryChange}
					/>
				) : null}
			</main>
		</div>
	)
}
