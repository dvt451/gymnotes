export default function AdminHeader({
	adminUser,
	isRefreshingSummary,
	onRefresh,
	onLogout,
}) {
	const initials = adminUser?.name
		? adminUser.name
			.split(' ')
			.filter(Boolean)
			.slice(0, 2)
			.map((part) => part[0]?.toUpperCase() || '')
			.join('')
		: 'AD'
	const roleLabel = adminUser?.role
		? adminUser.role.charAt(0).toUpperCase() + adminUser.role.slice(1)
		: 'Unknown'

	return (
		<header className="admin-header">
			<div className="admin-header-card">
				<div className="admin-header-identity">
					<div className="admin-header-avatar" aria-hidden="true">
						{initials}
					</div>
					<div className="admin-header-identity-copy">
						<strong>{adminUser.name}</strong>
						<span>{adminUser.email}</span>
					</div>
				</div>

				<div className="admin-header-chip-row">
					<span className="admin-header-chip">Role: {roleLabel}</span>
					<span className="admin-header-chip is-muted">Secure session</span>
				</div>

				<div className="admin-header-actions">
					<button
						className="admin-secondary-button"
						type="button"
						onClick={onRefresh}
						disabled={isRefreshingSummary}
					>
						{isRefreshingSummary ? 'Refreshing...' : 'Refresh data'}
					</button>
					<button className="admin-primary-button" type="button" onClick={onLogout}>
						Sign out
					</button>
				</div>
			</div>
		</header>
	)
}
