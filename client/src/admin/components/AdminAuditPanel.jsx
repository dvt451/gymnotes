import Select from '../../components/widgets/Select.jsx'
import { AUDIT_PAGE_SIZE_OPTIONS } from '../constants.js'
import { formatActionLabel, formatDate, stringifyDetails } from '../utils.js'
import AdminPagination from './AdminPagination.jsx'
import AdminStatusPill from './AdminStatusPill.jsx'

export default function AdminAuditPanel({
	auditQuery,
	adminSelectStyles,
	isAuditLoading,
	auditLogs,
	auditPagination,
	onAuditQueryChange,
}) {
	return (
		<section className="admin-panel">
			<div className="admin-panel-heading">
				<div>
					<p className="admin-eyebrow">Audit Trail</p>
					<h2>Recent admin actions</h2>
				</div>
			</div>

			<div className="admin-toolbar">
				<label className="admin-search">
					<span>Search audit logs</span>
					<input
						type="search"
						value={auditQuery.search}
						onChange={(event) => onAuditQueryChange('search', event.target.value)}
						placeholder="Search by action or email"
					/>
				</label>

				<label className="admin-filter">
					<span>Rows</span>
					<Select
						options={AUDIT_PAGE_SIZE_OPTIONS}
						value={String(auditQuery.pageSize)}
						onChange={(value) => onAuditQueryChange('pageSize', Number(value))}
						styles={adminSelectStyles}
					/>
				</label>
			</div>

			{isAuditLoading ? (
				<div className="admin-empty-state">Loading audit logs...</div>
			) : (
				<div className="admin-log-list">
					{auditLogs.map((log) => (
						<article className="admin-log-card" key={log.id}>
							<div className="admin-log-header">
								<div>
									<p className="admin-log-title">{formatActionLabel(log.action)}</p>
								</div>
								<AdminStatusPill tone="neutral">
									{log.target?.email || 'System'}
								</AdminStatusPill>
							</div>

							<div className="admin-log-context">
								<p className="admin-log-meta">
									<span className="admin-log-meta-label">Date</span>
									<span className="admin-log-meta-value">{formatDate(log.createdAt)}</span>
								</p>
								<p className="admin-log-meta">
									<span className="admin-log-meta-label">Performed by</span>
									<span className="admin-log-meta-value">
										{log.actor?.email || 'Unknown actor'}
									</span>
								</p>
								<p className="admin-log-meta">
									<span className="admin-log-meta-label">Affected user</span>
									<span className="admin-log-meta-value">
										{log.target?.email || 'System'}
									</span>
								</p>
							</div>

							<p className="admin-log-details">{stringifyDetails(log.details)}</p>
						</article>
					))}

					{auditLogs.length === 0 ? (
						<div className="admin-empty-state">No audit events recorded yet.</div>
					) : null}
				</div>
			)}

			<AdminPagination
				pagination={auditPagination}
				onPageChange={(page) => onAuditQueryChange('page', page)}
			/>
		</section>
	)
}
