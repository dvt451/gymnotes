import { useContext, useEffect } from 'react'
import { GlobalContext } from '../context/GlobalContext.jsx'
import AdminLoadingScreen from './components/AdminLoadingScreen.jsx'
import AdminLoginScreen from './components/AdminLoginScreen.jsx'
import AdminWorkspace from './components/AdminWorkspace.jsx'
import { GOOGLE_CLIENT_ID, PERMISSION_DEFINITIONS } from './constants.js'
import useAdminConsole from './hooks/useAdminConsole.js'
import { createMessage } from './utils.js'

export default function AdminApp() {
	const { setMainColor } = useContext(GlobalContext)
	const admin = useAdminConsole()

	useEffect(() => {
		setMainColor('#b85c38')
	}, [setMainColor])

	if (admin.isBootstrapping) {
		return <AdminLoadingScreen />
	}

	if (!admin.token || !admin.adminUser) {
		return (
			<AdminLoginScreen
				loginForm={admin.loginForm}
				message={admin.message}
				isLoggingIn={admin.isLoggingIn}
				isGoogleLoggingIn={admin.isGoogleLoggingIn}
				googleClientId={GOOGLE_CLIENT_ID}
				onSubmit={admin.handleLogin}
				onChange={admin.handleLoginChange}
				onGoogleCredential={admin.handleGoogleLogin}
				onGoogleError={(error) => admin.setMessage(createMessage('error', error.message || 'Google sign-in failed'))}
			/>
		)
	}

	return (
		<AdminWorkspace
			adminUser={admin.adminUser}
			message={admin.message}
			isRefreshingSummary={admin.isRefreshingSummary}
			onRefresh={() => admin.refreshCurrentView(admin.token)}
			onLogout={admin.handleLogout}
			activeTab={admin.activeTab}
			onTabChange={admin.setActiveTab}
			visibleTabs={admin.visibleTabs}
			overview={admin.overview}
			canViewDashboard={admin.canViewDashboard}
			canExportBackup={admin.canExportBackup}
			canRestoreBackup={admin.canRestoreBackup}
			isExportingBackup={admin.isExportingBackup}
			isRestoringBackup={admin.isRestoringBackup}
			onExportBackup={admin.handleExportBackup}
			onRestoreBackup={admin.handleRestoreBackup}
			availableRoles={admin.availableRoles}
			protectedRoles={admin.protectedRoles}
			rolePermissions={admin.rolePermissions}
			permissionDefinitions={PERMISSION_DEFINITIONS}
			newRoleName={admin.newRoleName}
			isSavingPermissionRole={admin.savingPermissionRole}
			isCreatingRole={admin.isCreatingRole}
			deletingRole={admin.deletingRole}
			onNewRoleNameChange={admin.setNewRoleName}
			onCreateRole={admin.handleCreateRole}
			onDeleteRole={admin.handleDeleteRole}
			onPermissionToggle={admin.handlePermissionToggle}
			onSaveRolePermissions={admin.handleSaveRolePermissions}
			userQuery={admin.userQuery}
			adminSelectStyles={admin.adminSelectStyles}
			isUsersLoading={admin.isUsersLoading}
			users={admin.users}
			currentUserRole={admin.currentUserRole}
			canManageRoles={admin.canManageRoles}
			canSuspendUsers={admin.canSuspendUsers}
			canRestoreUsers={admin.canRestoreUsers}
			canSoftDeleteUsers={admin.canSoftDeleteUsers}
			canPermanentDeleteUsers={admin.canPermanentDeleteUsers}
			canViewAccessMap={admin.canViewAccessMap}
			canManageUserPermissionOverrides={admin.canManageUserPermissionOverrides}
			draftRoles={admin.draftRoles}
			permissionOverrideDraft={admin.selectedPermissionOverrideDraft}
			busyActionKey={admin.busyActionKey}
			usersPagination={admin.usersPagination}
			selectedUserId={admin.selectedUserId}
			selectedUserDetail={admin.selectedUserDetail}
			isDetailLoading={admin.isDetailLoading}
			onUserQueryChange={admin.handleUserQueryChange}
			onRoleDraftChange={admin.handleRoleDraftChange}
			onSelectUser={admin.setSelectedUserId}
			onRoleSave={admin.handleRoleSave}
			onPermissionOverrideChange={admin.handlePermissionOverrideChange}
			onPermissionOverrideReset={admin.handlePermissionOverrideReset}
			onPermissionOverrideSave={admin.handlePermissionOverrideSave}
			onStatusToggle={admin.handleStatusToggle}
			onRestoreUser={admin.handleRestoreUser}
			onDeleteUser={admin.handleDeleteUser}
			onPermanentDeleteUser={admin.handlePermanentDeleteUser}
			onCloseDetail={() => admin.setSelectedUserId('')}
			auditQuery={admin.auditQuery}
			canViewAuditLogs={admin.canViewAuditLogs}
			canClearAuditLogs={admin.canClearAuditLogs}
			isAuditLoading={admin.isAuditLoading}
			isClearingAuditLogs={admin.isClearingAuditLogs}
			auditLogs={admin.auditLogs}
			auditPagination={admin.auditPagination}
			onAuditQueryChange={admin.handleAuditQueryChange}
			onClearAuditLogs={admin.handleClearAuditLogs}
		/>
	)
}
