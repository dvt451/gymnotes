import { formatActionLabel, formatDate, getDisplayStatus } from '../utils.js'
import AdminMetricCard from './AdminMetricCard.jsx'

export default function AdminUserDetailPanel({
	selectedUserId,
	selectedUserDetail,
	isDetailLoading,
	onClose,
}) {
	return (
		<div className="admin-detail-layout">
			<section className="admin-detail-panel">
				<div className="admin-detail-header">
					<div>
						<p className="admin-eyebrow">User Detail</p>
						<h2>{selectedUserDetail.user ? selectedUserDetail.user.name : 'Select a user'}</h2>
					</div>
					{selectedUserId ? (
						<button
							className="admin-secondary-button"
							type="button"
							onClick={onClose}
						>
							Close
						</button>
					) : null}
				</div>

				{isDetailLoading ? (
					<div className="admin-empty-state">Loading user details...</div>
				) : selectedUserDetail.user ? (
					<div className="admin-detail-content">
						<div className="admin-detail-grid">
							<AdminMetricCard label="Trainings" value={selectedUserDetail.summary?.trainingCount || 0} />
							<AdminMetricCard label="Dates" value={selectedUserDetail.summary?.trainingDateCount || 0} />
							<AdminMetricCard label="Exercise logs" value={selectedUserDetail.summary?.exerciseEntryCount || 0} />
							<AdminMetricCard label="Templates" value={selectedUserDetail.summary?.templateCount || 0} />
							<AdminMetricCard label="Custom exercises" value={selectedUserDetail.summary?.customExerciseCount || 0} />
							<AdminMetricCard label="Audit events" value={selectedUserDetail.summary?.auditLogCount || 0} />
						</div>

						<div className="admin-detail-block">
							<h3>Account</h3>
							<p>{selectedUserDetail.user.email}</p>
							<p>Status: {getDisplayStatus(selectedUserDetail.user)}</p>
							<p>Created: {formatDate(selectedUserDetail.user.createdAt)}</p>
							<p>Updated: {formatDate(selectedUserDetail.user.updatedAt)}</p>
						</div>

						<div className="admin-detail-block">
							<h3>Recent trainings</h3>
							{selectedUserDetail.recentTrainings.length === 0 ? (
								<p>No recent training files.</p>
							) : selectedUserDetail.recentTrainings.map((item) => (
								<p key={item.id}>{item.name} | {formatDate(item.updatedAt)}</p>
							))}
						</div>

						<div className="admin-detail-block">
							<h3>Recent templates</h3>
							{selectedUserDetail.recentTemplates.length === 0 ? (
								<p>No recent templates.</p>
							) : selectedUserDetail.recentTemplates.map((item) => (
								<p key={item.id}>{item.name} | {formatDate(item.updatedAt)}</p>
							))}
						</div>

						<div className="admin-detail-block">
							<h3>Recent audit events</h3>
							{selectedUserDetail.recentAuditLogs.length === 0 ? (
								<p>No audit events for this user.</p>
							) : selectedUserDetail.recentAuditLogs.map((log) => (
								<p key={log.id}>{formatActionLabel(log.action)} | {formatDate(log.createdAt)}</p>
							))}
						</div>
					</div>
				) : (
					<div className="admin-empty-state">Select a user to inspect account details.</div>
				)}
			</section>
		</div>
	)
}
