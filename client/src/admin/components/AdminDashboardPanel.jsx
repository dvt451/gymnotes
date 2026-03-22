import AdminMetricCard from './AdminMetricCard.jsx'

export default function AdminDashboardPanel({ overview }) {
	return (
		<section className="admin-panel">
			<div className="admin-panel-heading">
				<div>
					<p className="admin-eyebrow">Snapshot</p>
					<h2>System totals</h2>
				</div>
			</div>

			<div className="admin-metric-grid">
				<AdminMetricCard label="Users" value={overview.totalUsers} />
				<AdminMetricCard label="Deleted users" value={overview.totalDeletedUsers} />
				<AdminMetricCard label="Admins" value={overview.totalAdmins} />
				<AdminMetricCard label="Active users" value={overview.totalActiveUsers} />
				<AdminMetricCard label="Suspended users" value={overview.totalSuspendedUsers} />
				<AdminMetricCard label="Training plans" value={overview.totalTrainings} />
				<AdminMetricCard label="Training dates" value={overview.totalTrainingDates} />
				<AdminMetricCard label="Exercise logs" value={overview.totalExercises} />
				<AdminMetricCard label="Templates" value={overview.totalTemplates} />
				<AdminMetricCard label="Audit events" value={overview.totalAuditLogs} />
			</div>
		</section>
	)
}
