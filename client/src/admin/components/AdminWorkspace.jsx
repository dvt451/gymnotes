import { useContext } from 'react'
import AdminAuditPanel from './AdminAuditPanel.jsx'
import AdminDashboardPanel from './AdminDashboardPanel.jsx'
import AdminHeader from './AdminHeader.jsx'
import AdminPageBar from './AdminPageBar.jsx'
import AdminPermissionsPanel from './AdminPermissionsPanel.jsx'
import AdminTabs from './AdminTabs.jsx'
import AdminUsersPanel from './AdminUsersPanel.jsx'
import { GlobalContext } from '../../context/GlobalContext.jsx'

export default function AdminWorkspace({
	adminUser,
	message,
	isRefreshingSummary,
	onRefresh,
	onLogout,
	activeTab,
	onTabChange,
	visibleTabs,
	overview,
	canViewDashboard,
	canExportBackup,
	canRestoreBackup,
	isExportingBackup,
	isRestoringBackup,
	onExportBackup,
	onRestoreBackup,
	availableRoles,
	protectedRoles,
	rolePermissions,
	permissionDefinitions,
	newRoleName,
	isSavingPermissionRole,
	isCreatingRole,
	deletingRole,
	onNewRoleNameChange,
	onCreateRole,
	onDeleteRole,
	onPermissionToggle,
	onSaveRolePermissions,
	userQuery,
	adminSelectStyles,
	isUsersLoading,
	users,
	currentUserRole,
	canManageRoles,
	canSuspendUsers,
	canRestoreUsers,
	canSoftDeleteUsers,
	canPermanentDeleteUsers,
	canViewAccessMap,
	canManageUserPermissionOverrides,
	draftRoles,
	permissionOverrideDraft,
	busyActionKey,
	usersPagination,
	selectedUserId,
	selectedUserDetail,
	isDetailLoading,
	onUserQueryChange,
	onRoleDraftChange,
	onSelectUser,
	onRoleSave,
	onPermissionOverrideChange,
	onPermissionOverrideReset,
	onPermissionOverrideSave,
	onStatusToggle,
	onRestoreUser,
	onDeleteUser,
	onPermanentDeleteUser,
	onCloseDetail,
	auditQuery,
	canViewAuditLogs,
	canClearAuditLogs,
	isAuditLoading,
	isClearingAuditLogs,
	auditLogs,
	auditPagination,
	onAuditQueryChange,
	onClearAuditLogs,
}) {
	const { adminBarState, setAdminBarState } = useContext(GlobalContext);
	return (
		<div className="admin-shell">
			<div className="admin-shell-inner">
				{message?.text ? (
					<div className={`admin-message admin-message-${message.type}`}>{message.text}</div>
				) : null}

				<div className="admin-content-shell">
					<AdminPageBar
						adminUser={adminUser}
						isRefreshingSummary={isRefreshingSummary}
						onRefresh={onRefresh}
						onLogout={onLogout}
						activeTab={activeTab}
						onTabChange={onTabChange}
						visibleTabs={visibleTabs}
					/>
					<main className="admin-content">
						{activeTab === 'dashboard' ? (
							<AdminDashboardPanel
								overview={overview}
								canViewDashboard={canViewDashboard}
								canExportBackup={canExportBackup}
								canRestoreBackup={canRestoreBackup}
								isExportingBackup={isExportingBackup}
								isRestoringBackup={isRestoringBackup}
								onExportBackup={onExportBackup}
								onRestoreBackup={onRestoreBackup}
							/>
						) : null}

						{activeTab === 'permissions' ? (
							<AdminPermissionsPanel
								roles={availableRoles.filter((role) => role !== 'admin')}
								protectedRoles={protectedRoles}
								rolePermissions={rolePermissions}
								permissionDefinitions={permissionDefinitions}
								newRoleName={newRoleName}
								isSavingPermissionRole={isSavingPermissionRole}
								isCreatingRole={isCreatingRole}
								deletingRole={deletingRole}
								onNewRoleNameChange={onNewRoleNameChange}
								onCreateRole={onCreateRole}
								onDeleteRole={onDeleteRole}
								onPermissionToggle={onPermissionToggle}
								onSaveRolePermissions={onSaveRolePermissions}
							/>
						) : null}

						{activeTab === 'users' || activeTab === 'admins' ? (
							<AdminUsersPanel
								activeTab={activeTab}
								userQuery={userQuery}
								adminSelectStyles={adminSelectStyles}
								isUsersLoading={isUsersLoading}
								users={users}
								availableRoles={availableRoles}
								rolePermissions={rolePermissions}
								permissionDefinitions={permissionDefinitions}
								adminUser={adminUser}
								currentUserRole={currentUserRole}
								canManageRoles={canManageRoles}
								canSuspendUsers={canSuspendUsers}
								canRestoreUsers={canRestoreUsers}
								canSoftDeleteUsers={canSoftDeleteUsers}
								canPermanentDeleteUsers={canPermanentDeleteUsers}
								canViewAccessMap={canViewAccessMap}
								canManageUserPermissionOverrides={canManageUserPermissionOverrides}
								draftRoles={draftRoles}
								permissionOverrideDraft={permissionOverrideDraft}
								busyActionKey={busyActionKey}
								usersPagination={usersPagination}
								selectedUserId={selectedUserId}
								selectedUserDetail={selectedUserDetail}
								isDetailLoading={isDetailLoading}
								onUserQueryChange={onUserQueryChange}
								onRoleDraftChange={onRoleDraftChange}
								onSelectUser={onSelectUser}
								onRoleSave={onRoleSave}
								onPermissionOverrideChange={onPermissionOverrideChange}
								onPermissionOverrideReset={onPermissionOverrideReset}
								onPermissionOverrideSave={onPermissionOverrideSave}
								onStatusToggle={onStatusToggle}
								onRestoreUser={onRestoreUser}
								onDeleteUser={onDeleteUser}
								onPermanentDeleteUser={onPermanentDeleteUser}
								onCloseDetail={onCloseDetail}
							/>
						) : null}

						{activeTab === 'audit' ? (
							<AdminAuditPanel
								auditQuery={auditQuery}
								adminSelectStyles={adminSelectStyles}
								canViewAuditLogs={canViewAuditLogs}
								canClearAuditLogs={canClearAuditLogs}
								isAuditLoading={isAuditLoading}
								isClearingAuditLogs={isClearingAuditLogs}
								auditLogs={auditLogs}
								auditPagination={auditPagination}
								onAuditQueryChange={onAuditQueryChange}
								onClearAuditLogs={onClearAuditLogs}
							/>
						) : null}
					</main>
				</div>
			</div>
		</div>
	)
}
