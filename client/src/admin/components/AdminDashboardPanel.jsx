import { useState } from 'react'
import AdminMetricCard from './AdminMetricCard.jsx'

export default function AdminDashboardPanel({
	overview,
	isExportingBackup,
	isRestoringBackup,
	onExportBackup,
	onRestoreBackup,
}) {
	const [selectedBackupFile, setSelectedBackupFile] = useState(null)

	const handleRestoreClick = async () => {
		const didRestore = await onRestoreBackup(selectedBackupFile)
		if (didRestore) {
			setSelectedBackupFile(null)
		}
	}

	return (
		<>
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

			<section className="admin-panel">
				<div className="admin-panel-heading">
					<div>
						<p className="admin-eyebrow">Resilience</p>
						<h2>Backup and restore</h2>
					</div>
				</div>

				<div className="admin-backup-grid">
					<div className="admin-backup-card">
						<h3>Download backup</h3>
						<p className="admin-backup-note">
							Save the full database as JSON before changing clusters or making risky admin changes.
						</p>
						<div className="admin-backup-actions">
							<button
								type="button"
								className="admin-primary-button"
								onClick={onExportBackup}
								disabled={isExportingBackup || isRestoringBackup}
							>
								{isExportingBackup ? 'Preparing backup...' : 'Download JSON backup'}
							</button>
						</div>
					</div>

					<div className="admin-backup-card">
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
								disabled={isRestoringBackup || isExportingBackup}
								onChange={(event) => setSelectedBackupFile(event.target.files?.[0] || null)}
							/>
							<span className="admin-file-trigger" aria-hidden="true">
								<span className="admin-file-trigger-copy">
									<strong>{selectedBackupFile ? 'Backup ready' : 'Choose backup file'}</strong>
									<small>
										{selectedBackupFile
											? 'JSON file selected for restore'
											: 'Select a previously downloaded GymNotes JSON backup'}
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
								disabled={!selectedBackupFile || isRestoringBackup || isExportingBackup}
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
