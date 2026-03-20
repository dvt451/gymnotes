import { useEffect, useMemo, useState } from 'react'

const API_BASE_URL = import.meta.env.VITE_API_URL || ''
const TOKEN_STORAGE_KEY = 'gymnotes_admin_token'

const initialOverview = {
	totalUsers: 0,
	totalAdmins: 0,
	totalTrainings: 0,
	totalTrainingDates: 0,
	totalExercises: 0,
	totalTemplates: 0,
}

const defaultLoginForm = {
	email: '',
	password: '',
}

const createMessage = (type, text) => ({ type, text })

const formatDate = (value) => {
	if (!value) {
		return 'Never'
	}

	return new Intl.DateTimeFormat('en', {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
		hour: '2-digit',
		minute: '2-digit',
	}).format(new Date(value))
}

const fetchJson = async (url, options = {}) => {
	const response = await fetch(url, options)
	const contentType = response.headers.get('content-type') || ''
	const data = contentType.includes('application/json')
		? await response.json()
		: { message: await response.text() }

	if (!response.ok) {
		throw new Error(data?.message || 'Request failed')
	}

	return data
}

const MetricCard = ({ label, value }) => (
	<div className="admin-metric-card">
		<span className="admin-metric-label">{label}</span>
		<strong className="admin-metric-value">{value}</strong>
	</div>
)

export default function AdminApp() {
	const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY) || '')
	const [adminUser, setAdminUser] = useState(null)
	const [overview, setOverview] = useState(initialOverview)
	const [users, setUsers] = useState([])
	const [draftRoles, setDraftRoles] = useState({})
	const [loginForm, setLoginForm] = useState(defaultLoginForm)
	const [filter, setFilter] = useState('')
	const [activeTab, setActiveTab] = useState('dashboard')
	const [isBootstrapping, setIsBootstrapping] = useState(true)
	const [isLoggingIn, setIsLoggingIn] = useState(false)
	const [isRefreshing, setIsRefreshing] = useState(false)
	const [savingUserId, setSavingUserId] = useState('')
	const [message, setMessage] = useState(null)

	const resetSession = (nextMessage = null) => {
		localStorage.removeItem(TOKEN_STORAGE_KEY)
		setToken('')
		setAdminUser(null)
		setOverview(initialOverview)
		setUsers([])
		setDraftRoles({})
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

	const loadAdminData = async (activeToken = token, { silent = false } = {}) => {
		if (!activeToken) {
			setIsBootstrapping(false)
			return
		}

		if (silent) {
			setIsRefreshing(true)
		} else {
			setIsBootstrapping(true)
		}

		try {
			const headers = { Authorization: `Bearer ${activeToken}` }
			const [meData, overviewData, usersData] = await Promise.all([
				fetchJson(`${API_BASE_URL}/api/admin/me`, { headers }),
				fetchJson(`${API_BASE_URL}/api/admin/overview`, { headers }),
				fetchJson(`${API_BASE_URL}/api/admin/users`, { headers }),
			])

			setAdminUser(meData.user)
			setOverview(overviewData.overview || initialOverview)
			setUsers(usersData.users || [])
			setDraftRoles(
				Object.fromEntries((usersData.users || []).map((user) => [user.id, user.role]))
			)
			setMessage(null)
		} catch (error) {
			resetSession(createMessage('error', error.message || 'Admin session expired'))
		} finally {
			setIsBootstrapping(false)
			setIsRefreshing(false)
		}
	}

	useEffect(() => {
		if (!token) {
			setIsBootstrapping(false)
			return
		}

		loadAdminData(token)
	}, [token])

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

	const handleRoleSave = async (userId) => {
		setSavingUserId(userId)
		setMessage(null)

		try {
			const data = await fetchJson(`${API_BASE_URL}/api/admin/users/${userId}/role`, {
				method: 'PATCH',
				headers: authHeaders,
				body: JSON.stringify({ role: draftRoles[userId] }),
			})

			setUsers((current) => current.map((user) => (
				user.id === userId
					? {
						...user,
						role: data.user.role,
						updatedAt: data.user.updatedAt,
					}
					: user
			)))
			setDraftRoles((current) => ({
				...current,
				[userId]: data.user.role,
			}))

			if (adminUser?.id === userId) {
				setAdminUser((current) => ({
					...current,
					role: data.user.role,
				}))
			}

			await loadAdminData(token, { silent: true })
			setMessage(createMessage('success', data.message || 'Role updated'))
		} catch (error) {
			setMessage(createMessage('error', error.message || 'Unable to update role'))
		} finally {
			setSavingUserId('')
		}
	}

	const filteredUsers = useMemo(() => {
		const normalizedFilter = filter.trim().toLowerCase()

		if (!normalizedFilter) {
			return users
		}

		return users.filter((user) => {
			const haystack = `${user.name} ${user.email} ${user.role}`.toLowerCase()
			return haystack.includes(normalizedFilter)
		})
	}, [filter, users])

	if (isBootstrapping) {
		return (
			<div className="admin-screen admin-screen-loading">
				<div className="admin-loading-panel">
					<span className="admin-loading-kicker">GymNotes Admin</span>
					<h1>Loading control surface</h1>
				</div>
			</div>
		)
	}

	if (!token || !adminUser) {
		return (
			<div className="admin-screen">
				<div className="admin-login-shell">
					<section className="admin-login-card">
						<p className="admin-eyebrow">Admin Access</p>
						<h1>GymNotes control surface</h1>
						<p className="admin-subtitle">
							Use an account with the <code>admin</code> role. If this is the first admin,
							promote one from the server with <code>npm run user:role --prefix server -- your@email admin</code>.
						</p>

						<form className="admin-login-form" onSubmit={handleLogin}>
							<label className="admin-field">
								<span>Email</span>
								<input
									autoComplete="email"
									name="email"
									type="email"
									value={loginForm.email}
									onChange={handleLoginChange}
									placeholder="admin@gymnotes.app"
									required
								/>
							</label>

							<label className="admin-field">
								<span>Password</span>
								<input
									autoComplete="current-password"
									name="password"
									type="password"
									value={loginForm.password}
									onChange={handleLoginChange}
									placeholder="Enter password"
									required
								/>
							</label>

							<button className="admin-primary-button" disabled={isLoggingIn} type="submit">
								{isLoggingIn ? 'Signing in...' : 'Sign in as admin'}
							</button>
						</form>

						{message?.text ? (
							<p className={`admin-message admin-message-${message.type}`}>{message.text}</p>
						) : null}
					</section>
				</div>
			</div>
		)
	}

	return (
		<div className="admin-shell">
			<header className="admin-header">
				<div>
					<p className="admin-eyebrow">GymNotes Admin</p>
					<h1>Operations dashboard</h1>
					<p className="admin-subtitle">
						Signed in as {adminUser.name} ({adminUser.email})
					</p>
				</div>

				<div className="admin-header-actions">
					<button
						className="admin-secondary-button"
						type="button"
						onClick={() => loadAdminData(token, { silent: true })}
						disabled={isRefreshing}
					>
						{isRefreshing ? 'Refreshing...' : 'Refresh'}
					</button>
					<button className="admin-primary-button" type="button" onClick={handleLogout}>
						Log out
					</button>
				</div>
			</header>

			{message?.text ? (
				<div className={`admin-message admin-message-${message.type}`}>{message.text}</div>
			) : null}

			<nav className="admin-tabs" aria-label="Admin sections">
				<button
					type="button"
					className={activeTab === 'dashboard' ? 'admin-tab active' : 'admin-tab'}
					onClick={() => setActiveTab('dashboard')}
				>
					Dashboard
				</button>
				<button
					type="button"
					className={activeTab === 'users' ? 'admin-tab active' : 'admin-tab'}
					onClick={() => setActiveTab('users')}
				>
					Users
				</button>
			</nav>

			<main className="admin-content">
				{activeTab === 'dashboard' ? (
					<section className="admin-panel">
						<div className="admin-panel-heading">
							<div>
								<p className="admin-eyebrow">Snapshot</p>
								<h2>System totals</h2>
							</div>
						</div>

						<div className="admin-metric-grid">
							<MetricCard label="Users" value={overview.totalUsers} />
							<MetricCard label="Admins" value={overview.totalAdmins} />
							<MetricCard label="Training plans" value={overview.totalTrainings} />
							<MetricCard label="Training dates" value={overview.totalTrainingDates} />
							<MetricCard label="Exercise logs" value={overview.totalExercises} />
							<MetricCard label="Templates" value={overview.totalTemplates} />
						</div>
					</section>
				) : null}

				{activeTab === 'users' ? (
					<section className="admin-panel">
						<div className="admin-panel-heading">
							<div>
								<p className="admin-eyebrow">Directory</p>
								<h2>User access and activity</h2>
							</div>

							<label className="admin-search">
								<span>Filter users</span>
								<input
									type="search"
									value={filter}
									onChange={(event) => setFilter(event.target.value)}
									placeholder="Search by name, email or role"
								/>
							</label>
						</div>

						<div className="admin-table-wrap">
							<table className="admin-table">
								<thead>
									<tr>
										<th>User</th>
										<th>Role</th>
										<th>Trainings</th>
										<th>Custom exercises</th>
										<th>Created</th>
										<th>Updated</th>
										<th>Action</th>
									</tr>
								</thead>
								<tbody>
									{filteredUsers.map((user) => {
										const nextRole = draftRoles[user.id] || user.role
										const isSaving = savingUserId === user.id
										const isDirty = nextRole !== user.role

										return (
											<tr key={user.id}>
												<td>
													<div className="admin-user-cell">
														<strong>{user.name}</strong>
														<span>{user.email}</span>
													</div>
												</td>
												<td>
													<select
														value={nextRole}
														onChange={(event) => handleRoleDraftChange(user.id, event.target.value)}
														disabled={isSaving}
													>
														<option value="user">user</option>
														<option value="admin">admin</option>
													</select>
												</td>
												<td>{user.trainingCount}</td>
												<td>{user.customExerciseCount}</td>
												<td>{formatDate(user.createdAt)}</td>
												<td>{formatDate(user.updatedAt)}</td>
												<td>
													<button
														className="admin-inline-button"
														type="button"
														onClick={() => handleRoleSave(user.id)}
														disabled={!isDirty || isSaving}
													>
														{isSaving ? 'Saving...' : 'Save'}
													</button>
												</td>
											</tr>
										)
									})}
								</tbody>
							</table>

							{filteredUsers.length === 0 ? (
								<div className="admin-empty-state">No users matched this filter.</div>
							) : null}
						</div>
					</section>
				) : null}
			</main>
		</div>
	)
}
