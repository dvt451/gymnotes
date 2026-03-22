export default function AdminHeader({
	adminUser,
	isRefreshingSummary,
	onRefresh,
	onLogout,
}) {
	return (
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
					onClick={onRefresh}
					disabled={isRefreshingSummary}
				>
					{isRefreshingSummary ? 'Refreshing...' : 'Refresh'}
				</button>
				<button className="admin-primary-button" type="button" onClick={onLogout}>
					Log out
				</button>
			</div>
		</header>
	)
}
