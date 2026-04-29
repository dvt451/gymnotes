const defaultTabs = [
	{ id: 'dashboard', label: 'Dashboard' },
	{ id: 'users', label: 'Users' },
	{ id: 'admins', label: 'Admins' },
	{ id: 'audit', label: 'Audit' },
]

const tabDescriptions = {
	dashboard: 'Overview and backups',
	permissions: 'Role access rules',
	users: 'Members and moderation',
	admins: 'Privileged accounts',
	audit: 'Action history',
}

export default function AdminTabs({ activeTab, onChange, tabs = defaultTabs }) {
	return (
		<nav className="admin-tabs admin-nav-row" aria-label="Admin sections">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					type="button"
					className={activeTab === tab.id ? 'admin-tab active' : 'admin-tab'}
					onClick={() => onChange(tab.id)}
					aria-current={activeTab === tab.id ? 'page' : undefined}
				>
					<span className="admin-tab-copy">
						<strong>{tab.label}</strong>
						<small>{tabDescriptions[tab.id] || 'Console section'}</small>
					</span>
				</button>
			))}
		</nav>
	)
}
