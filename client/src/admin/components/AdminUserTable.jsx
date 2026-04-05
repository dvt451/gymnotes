import Select from '../../components/widgets/Select.jsx'
import { formatDate, getDisplayStatus, getStatusTone } from '../utils.js'
import AdminPagination from './AdminPagination.jsx'
import AdminStatusPill from './AdminStatusPill.jsx'

export default function AdminUserTable({
	rows,
	availableRoles,
	adminUser,
	currentUserRole,
	canManageRoles,
	canSuspendUsers,
	canRestoreUsers,
	canSoftDeleteUsers,
	canPermanentDeleteUsers,
	draftRoles,
	busyActionKey,
	adminSelectStyles,
	usersPagination,
	onRoleDraftChange,
	onSelectUser,
	onRoleSave,
	onStatusToggle,
	onRestoreUser,
	onDeleteUser,
	onPermanentDeleteUser,
	onPageChange,
	emptyMessage,
}) {
	const normalizedRoles = availableRoles?.length ? availableRoles : ['user', 'admin']
	const roleOptionsForCurrentUser =
		currentUserRole === 'admin'
			? normalizedRoles
			: normalizedRoles.filter((role) => role !== 'admin')

	return (
		<>
			<div className="admin-table-wrap">
				<table className="admin-table">
					<thead>
						<tr>
							<th>User</th>
							<th>Role</th>
							<th>Status</th>
							<th>Trainings</th>
							<th>Custom exercises</th>
							<th>Updated</th>
							<th>Actions</th>
						</tr>
					</thead>
					<tbody>
						{rows.map((user) => {
							const nextRole = draftRoles[user.id] || user.role
							const isRoleBusy = busyActionKey === `role:${user.id}`
							const isStatusBusy = busyActionKey === `status:${user.id}`
							const isRestoreBusy = busyActionKey === `restore:${user.id}`
							const isDeleteBusy = busyActionKey === `delete:${user.id}`
							const isPermanentDeleteBusy = busyActionKey === `permanent-delete:${user.id}`
							const isDirtyRole = nextRole !== user.role
							const isCurrentAdmin = adminUser?.id === user.id
							const displayStatus = getDisplayStatus(user)
							const isDeleted = user.isDeleted
							const isAdminTarget = user.role === 'admin'
							const canManageRoleForTarget =
								canManageRoles &&
								!(currentUserRole === 'moderator' && isAdminTarget)
							const canManageSuspendForTarget =
								canSuspendUsers &&
								!(currentUserRole === 'moderator' && isAdminTarget)
							const canManageRestoreForTarget =
								canRestoreUsers &&
								!(currentUserRole === 'moderator' && isAdminTarget)
							const canManageSoftDeleteForTarget =
								canSoftDeleteUsers &&
								!(currentUserRole === 'moderator' && isAdminTarget)
							const canManagePermanentDeleteForTarget =
								canPermanentDeleteUsers &&
								!(currentUserRole === 'moderator' && isAdminTarget)
							const roleOptions =
								roleOptionsForCurrentUser.includes(user.role)
									? roleOptionsForCurrentUser
									: [user.role, ...roleOptionsForCurrentUser.filter((role) => role !== user.role)]
							const canSaveRoleChoice =
								canManageRoleForTarget &&
								(currentUserRole === 'admin' || nextRole !== 'admin')
							const isRoleLocked =
								!canManageRoleForTarget ||
								isCurrentAdmin ||
								isRoleBusy ||
								isDeleteBusy ||
								isRestoreBusy ||
								isPermanentDeleteBusy ||
								isDeleted

							return (
								<tr key={user.id}>
									<td>
										<div className="admin-user-cell">
											<strong>{user.name}</strong>
											<span>{user.email}</span>
											{user.suspensionReason ? (
												<span className="admin-user-note">
													Suspension: {user.suspensionReason}
												</span>
											) : null}
											{user.deletionReason ? (
												<span className="admin-user-note">
													Deleted: {user.deletionReason}
												</span>
											) : null}
										</div>
									</td>
									<td>
										<Select
											options={roleOptions}
											value={nextRole}
											onChange={(value) => onRoleDraftChange(user.id, value)}
											disabled={isRoleLocked}
											styles={adminSelectStyles}
										/>
									</td>
									<td>
										<div className="admin-pill-stack">
											<AdminStatusPill tone={user.role === 'admin' ? 'admin' : 'neutral'}>
												{user.role}
											</AdminStatusPill>
											<AdminStatusPill tone={getStatusTone(user)}>
												{displayStatus}
											</AdminStatusPill>
										</div>
									</td>
									<td>{user.trainingCount}</td>
									<td>{user.customExerciseCount}</td>
									<td>{formatDate(user.updatedAt)}</td>
									<td>
										<div className="admin-action-group">
											<button
												className="admin-secondary-button"
												type="button"
												onClick={() => onSelectUser(user.id)}
											>
												View
											</button>
											<button
												className="admin-inline-button"
												type="button"
												onClick={() => onRoleSave(user)}
												disabled={!isDirtyRole || !canSaveRoleChoice || isRoleLocked || isStatusBusy}
											>
												{isRoleBusy ? 'Saving...' : 'Save role'}
											</button>
											<button
												className={isDeleted || displayStatus !== 'active' ? 'admin-secondary-button' : 'admin-warn-button'}
												type="button"
												onClick={() => (isDeleted ? onRestoreUser(user) : onStatusToggle(user))}
												disabled={!(isDeleted ? canManageRestoreForTarget : canManageSuspendForTarget) || isDeleteBusy || isStatusBusy || isRestoreBusy || isPermanentDeleteBusy || (isCurrentAdmin && user.accountStatus === 'active')}
											>
												{isRestoreBusy
													? 'Restoring...'
													: isStatusBusy
													? 'Saving...'
													: isDeleted
														? 'Restore'
														: user.accountStatus === 'active'
														? 'Suspend'
														: 'Reactivate'}
											</button>
											<button
												className="admin-danger-button"
												type="button"
												onClick={() => onDeleteUser(user)}
												disabled={!canManageSoftDeleteForTarget || isDeleteBusy || isPermanentDeleteBusy || isCurrentAdmin || isDeleted}
											>
												{isDeleteBusy ? 'Deleting...' : 'Soft delete'}
											</button>
											<button
												className="admin-danger-button admin-danger-button-strong"
												type="button"
												onClick={() => onPermanentDeleteUser(user)}
												disabled={!canManagePermanentDeleteForTarget || isDeleteBusy || isPermanentDeleteBusy || isStatusBusy || isRestoreBusy || isCurrentAdmin || !isDeleted}
											>
												{isPermanentDeleteBusy ? 'Removing...' : 'Permanent delete'}
											</button>
										</div>
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>

				{rows.length === 0 ? <div className="admin-empty-state">{emptyMessage}</div> : null}
			</div>

			<AdminPagination pagination={usersPagination} onPageChange={onPageChange} />
		</>
	)
}
