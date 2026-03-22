const tabs = [
	{ id: 'dashboard', label: 'Dashboard' },
	{ id: 'users', label: 'Users' },
	{ id: 'admins', label: 'Admins' },
	{ id: 'audit', label: 'Audit' },
]

export default function AdminTabs({ activeTab, onChange }) {
	return (
		<nav className="admin-tabs" aria-label="Admin sections">
			{tabs.map((tab) => (
				<button
					key={tab.id}
					type="button"
					className={activeTab === tab.id ? 'admin-tab active' : 'admin-tab'}
					onClick={() => onChange(tab.id)}
				>
					{tab.label}
				</button>
			))}
		</nav>
	)
}
