import Select from '../../components/widgets/Select.jsx';
import { formatActionLabel, formatDate, getDisplayStatus } from '../utils.js'
import AdminMetricCard from './AdminMetricCard.jsx'

export default function AdminUserDetailPanel({
	selectedUserId,
	selectedUserDetail,
	isDetailLoading,
	canViewAccessMap,
	canManageUserPermissionOverrides,
	permissionDefinitions,
	rolePermissions,
	permissionOverrideDraft,
	isSavingPermissionOverrides,
	onPermissionOverrideChange,
	onPermissionOverrideReset,
	onPermissionOverrideSave,
	onClose,
	adminSelectStyles,
}) {
	const selectedUser = selectedUserDetail.user;
	const roleDefaults = canManageUserPermissionOverrides
		? rolePermissions?.[selectedUser?.role] ||
		Object.fromEntries(permissionDefinitions.map(({ key }) => [key, false]))
		: null;
	const roleOptions = [
		'Inherit role',
		'Allow explicitly',
		'Deny explicitly',
	]

	return (
		<div className="admin-detail-layout">
			<section className="admin-detail-panel">
				<div className="admin-detail-header">
					<div>
						<p className="admin-eyebrow">User Detail</p>
						<h2>{selectedUser ? selectedUser.name : 'Select a user'}</h2>
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
				) : selectedUser ? (
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
							<p>{selectedUser.email}</p>
							<p>Role: {selectedUser.role}</p>
							<p>Status: {getDisplayStatus(selectedUser)}</p>
							<p>Created: {formatDate(selectedUser.createdAt)}</p>
							<p>Updated: {formatDate(selectedUser.updatedAt)}</p>
						</div>

						{canViewAccessMap && selectedUser.permissions ? (
							<div className="admin-detail-block">
								<h3>Access map</h3>
								<div className="admin-detail-permission-list">
									{permissionDefinitions.map(({ key, label }) => {
										const effectiveValue = Boolean(selectedUser.permissions?.[key])
										const roleValue = Boolean(roleDefaults?.[key])
										const overrideMode = permissionOverrideDraft?.[key] || 'inherit'

										return (
											<div className="admin-detail-permission-row" key={key}>
												<div className="admin-detail-permission-copy">
													<strong>{label}</strong>
													<small>
														{roleDefaults
															? `Role: ${roleValue ? 'allowed' : 'blocked'} | Effective: ${effectiveValue ? 'allowed' : 'blocked'}`
															: `Effective: ${effectiveValue ? 'allowed' : 'blocked'}`}
													</small>
												</div>
												{canManageUserPermissionOverrides && selectedUser.role !== 'admin' ? (
													<>
														<Select
															options={roleOptions}
															value={overrideMode === 'inherit' ? roleValue : overrideMode}
															onChange={(event) => onPermissionOverrideChange(key, event.target.value)}
															disabled={isSavingPermissionOverrides}
															styles={adminSelectStyles}
														/>
													</>
												) : (
													<span className={`admin-role-badge ${effectiveValue ? 'is-allowed' : 'is-blocked'}`}>
														{effectiveValue ? 'Allowed' : 'Blocked'}
													</span>
												)}
											</div>
										)
									})}
								</div>
								{canManageUserPermissionOverrides ? (
									selectedUser.role === 'admin' ? (
										<p className="admin-detail-help">
											Admin accounts always keep full access and do not support custom overrides.
										</p>
									) : (
										<div className="admin-detail-actions">
											<button
												type="button"
												className="admin-secondary-button"
												onClick={onPermissionOverrideReset}
												disabled={isSavingPermissionOverrides}
											>
												Reset overrides
											</button>
											<button
												type="button"
												className="admin-primary-button"
												onClick={onPermissionOverrideSave}
												disabled={isSavingPermissionOverrides}
											>
												{isSavingPermissionOverrides ? 'Saving...' : 'Save user access'}
											</button>
										</div>
									)
								) : null}
							</div>
						) : null}

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
