import { useState } from 'react'
import AdminMetricCard from './AdminMetricCard.jsx'

export default function AdminDashboardPanel({
	overview,
	canViewDashboard,
	canExportBackup,
	canRestoreBackup,
	isExportingBackup,
	isRestoringBackup,
	onExportBackup,
	onRestoreBackup,
}) {
	const [selectedBackupFile, setSelectedBackupFile] = useState(null)
	const safeTotalUsers = overview.totalUsers || 0
	const activeRatio = safeTotalUsers
		? Math.round((overview.totalActiveUsers / safeTotalUsers) * 100)
		: 0
	const privilegedAccounts = overview.totalAdmins + overview.totalModerators
	const summaryHighlights = [
		{
			label: 'Active users',
			value: `${activeRatio}%`,
			description: `${overview.totalActiveUsers} of ${safeTotalUsers} accounts are active.`,
		},
		{
			label: 'Privileged roles',
			value: privilegedAccounts,
			description: `${overview.totalAdmins} admins and ${overview.totalModerators} moderators currently have elevated access.`,
		},
		{
			label: 'Recovery queue',
			value: overview.totalDeletedUsers + overview.totalSuspendedUsers,
			description: `${overview.totalDeletedUsers} deleted and ${overview.totalSuspendedUsers} suspended accounts may need review.`,
		},
	]

	const handleRestoreClick = async () => {
		const didRestore = await onRestoreBackup(selectedBackupFile)
		if (didRestore) {
			setSelectedBackupFile(null)
		}
	}

	return (
		<>
			{canViewDashboard ? (
				<section className="admin-panel admin-panel-hero">
					<div className="admin-panel-heading">
						<div>
							<p className="admin-eyebrow">Snapshot</p>
							<h2>System totals</h2>
							<p className="admin-panel-description">
								A quick read on account health, activity volume, and privileged access across Lift Log.
							</p>
						</div>
					</div>

					<div className="admin-highlight-grid">
						{summaryHighlights.map((item) => (
							<article className="admin-highlight-card" key={item.label}>
								<span className="admin-highlight-label">{item.label}</span>
								<strong className="admin-highlight-value">{item.value}</strong>
								<p className="admin-highlight-description">{item.description}</p>
							</article>
						))}
					</div>

					<div className="admin-metric-grid">
						<AdminMetricCard label="Users" value={overview.totalUsers} />
						<AdminMetricCard label="Deleted users" value={overview.totalDeletedUsers} />
						<AdminMetricCard label="Admins" value={overview.totalAdmins} />
						<AdminMetricCard label="Moderators" value={overview.totalModerators} />
						<AdminMetricCard label="Trainees" value={overview.totalTrainees} />
						<AdminMetricCard label="Active users" value={overview.totalActiveUsers} />
						<AdminMetricCard label="Suspended users" value={overview.totalSuspendedUsers} />
						<AdminMetricCard label="Training plans" value={overview.totalTrainings} />
						<AdminMetricCard label="Training dates" value={overview.totalTrainingDates} />
						<AdminMetricCard label="Exercise logs" value={overview.totalExercises} />
						<AdminMetricCard label="Templates" value={overview.totalTemplates} />
						<AdminMetricCard label="Audit events" value={overview.totalAuditLogs} />
					</div>
				</section>
			) : null}

			<section className="admin-panel">
				<div className="admin-panel-heading">
					<div>
						<p className="admin-eyebrow">Resilience</p>
						<h2>Backup and restore</h2>
						<p className="admin-panel-description">
							Protect production data before risky changes and recover from a known-good JSON export when needed.
						</p>
					</div>
				</div>

				<div className="admin-backup-grid">
					<div className="admin-backup-card">
						<span className="admin-card-kicker">Export</span>
						<h3>Download backup</h3>
						<p className="admin-backup-note">
							Save the full database as JSON before changing clusters or making risky admin changes.
						</p>
						{!canExportBackup ? (
							<p className="admin-backup-note">Your role cannot download backups right now.</p>
						) : null}
						<div className="admin-backup-actions">
							<button
								type="button"
								className="admin-primary-button"
								onClick={onExportBackup}
								disabled={!canExportBackup || isExportingBackup || isRestoringBackup}
							>
								{isExportingBackup ? 'Preparing backup...' : 'Download JSON backup'}
							</button>
						</div>
					</div>

					<div className="admin-backup-card">
						<span className="admin-card-kicker">Restore</span>
						<h3>Restore backup</h3>
						<p className="admin-backup-note">
							Import a previously downloaded backup and replace the current database contents.
						</p>
						<label className="admin-file-input admin-file-input-shell">
							<span>Backup file</span>
							<input
								key={selectedBackupFile?.name || 'empty-backup-file'}
								className="admin-file-input-native"
								type="file"
								accept=".json,application/json"
								disabled={!canRestoreBackup || isRestoringBackup || isExportingBackup}
								onChange={(event) => setSelectedBackupFile(event.target.files?.[0] || null)}
							/>
							<span className="admin-file-trigger" aria-hidden="true">
								<span className="admin-file-trigger-copy">
									<strong>{selectedBackupFile ? 'Backup ready' : 'Choose backup file'}</strong>
									<small>
										{selectedBackupFile
											? 'JSON file selected for restore'
											: 'Select a previously downloaded Lift Log JSON backup'}
									</small>
								</span>
								<span className="admin-file-trigger-chip">
									{selectedBackupFile ? 'Change file' : 'Browse'}
								</span>
							</span>
						</label>
						<p className="admin-backup-file">
							{selectedBackupFile ? selectedBackupFile.name : 'No backup file selected'}
						</p>
						<div className="admin-backup-actions">
							<button
								type="button"
								className="admin-danger-button"
								onClick={handleRestoreClick}
								disabled={!canRestoreBackup || !selectedBackupFile || isRestoringBackup || isExportingBackup}
							>
								{isRestoringBackup ? 'Restoring backup...' : 'Restore from file'}
							</button>
						</div>
					</div>
				</div>
			</section>
		</>
	)
}
