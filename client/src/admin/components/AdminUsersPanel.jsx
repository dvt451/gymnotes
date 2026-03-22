import Select from '../../components/widgets/Select.jsx'
import { STATUS_OPTIONS, USER_PAGE_SIZE_OPTIONS } from '../constants.js'
import AdminUserDetailPanel from './AdminUserDetailPanel.jsx'
import AdminUserTable from './AdminUserTable.jsx'

export default function AdminUsersPanel({
	activeTab,
	userQuery,
	adminSelectStyles,
	isUsersLoading,
	users,
	adminUser,
	draftRoles,
	busyActionKey,
	usersPagination,
	selectedUserId,
	selectedUserDetail,
	isDetailLoading,
	onUserQueryChange,
	onRoleDraftChange,
	onSelectUser,
	onRoleSave,
	onStatusToggle,
	onRestoreUser,
	onDeleteUser,
	onCloseDetail,
}) {
	const emptyMessage =
		activeTab === 'admins'
			? 'No admin accounts matched this filter.'
			: 'No users matched this filter.'

	return (
		<section className="admin-panel">
			<div className="admin-panel-heading">
				<div>
					<p className="admin-eyebrow">{activeTab === 'admins' ? 'Privileged Access' : 'Directory'}</p>
					<h2>{activeTab === 'admins' ? 'Admin accounts' : 'User access and activity'}</h2>
				</div>
			</div>

			<div className="admin-toolbar">
				<label className="admin-search">
					<span>Search</span>
					<input
						type="search"
						value={userQuery.search}
						onChange={(event) => onUserQueryChange('search', event.target.value)}
						placeholder="Search by name or email"
					/>
				</label>

				<label className="admin-filter">
					<span>Status</span>
					<Select
						options={STATUS_OPTIONS}
						value={userQuery.status}
						onChange={(value) => onUserQueryChange('status', value)}
						styles={adminSelectStyles}
					/>
				</label>

				<label className="admin-filter">
					<span>Rows</span>
					<Select
						options={USER_PAGE_SIZE_OPTIONS}
						value={String(userQuery.pageSize)}
						onChange={(value) => onUserQueryChange('pageSize', Number(value))}
						styles={adminSelectStyles}
					/>
				</label>

				<label className="admin-checkbox">
					<input
						type="checkbox"
						checked={userQuery.includeDeleted}
						onChange={(event) => onUserQueryChange('includeDeleted', event.target.checked)}
					/>
					<span>Include deleted</span>
				</label>
			</div>

			{isUsersLoading ? (
				<div className="admin-empty-state">Loading users...</div>
			) : (
				<AdminUserTable
					rows={users}
					adminUser={adminUser}
					draftRoles={draftRoles}
					busyActionKey={busyActionKey}
					adminSelectStyles={adminSelectStyles}
					usersPagination={usersPagination}
					onRoleDraftChange={onRoleDraftChange}
					onSelectUser={onSelectUser}
					onRoleSave={onRoleSave}
					onStatusToggle={onStatusToggle}
					onRestoreUser={onRestoreUser}
					onDeleteUser={onDeleteUser}
					onPageChange={(page) => onUserQueryChange('page', page)}
					emptyMessage={emptyMessage}
				/>
			)}

			<AdminUserDetailPanel
				selectedUserId={selectedUserId}
				selectedUserDetail={selectedUserDetail}
				isDetailLoading={isDetailLoading}
				onClose={onCloseDetail}
			/>
		</section>
	)
}
