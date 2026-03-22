import Select from '../../components/widgets/Select.jsx'
import { ROLE_OPTIONS } from '../constants.js'
import { formatDate, getDisplayStatus, getStatusTone } from '../utils.js'
import AdminPagination from './AdminPagination.jsx'
import AdminStatusPill from './AdminStatusPill.jsx'

export default function AdminUserTable({
	rows,
	adminUser,
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
	onPageChange,
	emptyMessage,
}) {
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
							const isDirtyRole = nextRole !== user.role
							const isCurrentAdmin = adminUser?.id === user.id
							const displayStatus = getDisplayStatus(user)
							const isDeleted = user.isDeleted
							const isRoleLocked = isCurrentAdmin || isRoleBusy || isDeleteBusy || isRestoreBusy || isDeleted

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
											options={ROLE_OPTIONS}
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
												disabled={!isDirtyRole || isRoleLocked || isStatusBusy}
											>
												{isRoleBusy ? 'Saving...' : 'Save role'}
											</button>
											<button
												className={isDeleted || displayStatus !== 'active' ? 'admin-secondary-button' : 'admin-warn-button'}
												type="button"
												onClick={() => (isDeleted ? onRestoreUser(user) : onStatusToggle(user))}
												disabled={isDeleteBusy || isStatusBusy || isRestoreBusy || (isCurrentAdmin && user.accountStatus === 'active')}
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
												disabled={isDeleteBusy || isCurrentAdmin || isDeleted}
											>
												{isDeleteBusy ? 'Deleting...' : 'Soft delete'}
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
