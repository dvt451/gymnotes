export default function AdminPermissionsPanel({
	roles,
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
}) {
	const permissionRoles = roles?.length ? roles : Object.keys(rolePermissions)

	return (
		<section className="admin-panel">
			<div className="admin-panel-heading">
				<div>
					<p className="admin-eyebrow">Permissions</p>
					<h2>Role access matrix</h2>
				</div>
			</div>

			<div className="admin-role-creator">
				<div className="admin-role-creator-copy">
					<h3>Create role</h3>
					<p>
						New roles start with no permissions. You can enable exactly what they are allowed to do.
					</p>
				</div>
				<div className="admin-role-creator-controls">
					<input
						type="text"
						value={newRoleName}
						onChange={(event) => onNewRoleNameChange(event.target.value)}
						placeholder="coach_assistant"
						disabled={isCreatingRole}
					/>
					<button
						type="button"
						className="admin-primary-button"
						onClick={onCreateRole}
						disabled={isCreatingRole || !newRoleName.trim()}
					>
						{isCreatingRole ? 'Creating...' : 'Create role'}
					</button>
				</div>
			</div>

			<div className="admin-permission-grid">
				{permissionRoles.map((role) => {
					const permissions = rolePermissions[role]
					const isProtectedRole = protectedRoles.includes(role)
					const enabledCount = permissionDefinitions.filter(({ key }) => Boolean(permissions?.[key])).length

					return (
						<div className="admin-permission-card" key={role}>
							<div className="admin-permission-card-header">
								<div>
									<h3>{role}</h3>
									<p>
										Configure what this role can do in the admin console.
									</p>
									<span className="admin-role-badge is-allowed">
										{enabledCount} of {permissionDefinitions.length} enabled
									</span>
								</div>
								{!isProtectedRole ? (
									<button
										type="button"
										className="admin-inline-button admin-inline-button-danger"
										onClick={() => onDeleteRole(role)}
										disabled={deletingRole === role || isSavingPermissionRole === role}
									>
										{deletingRole === role ? 'Deleting...' : 'Delete role'}
									</button>
								) : (
									<span className="admin-role-badge">Protected</span>
								)}
							</div>

							<div className="admin-permission-list">
								{permissionDefinitions.map(({ key, label }) => (
									<label className="admin-permission-item" key={key}>
										<span>{label}</span>
										<input
											type="checkbox"
											checked={Boolean(permissions?.[key])}
											onChange={(event) => onPermissionToggle(role, key, event.target.checked)}
											disabled={isSavingPermissionRole === role}
										/>
									</label>
								))}
							</div>

							<div className="admin-backup-actions">
								<button
									type="button"
									className="admin-primary-button"
									onClick={() => onSaveRolePermissions(role)}
									disabled={isSavingPermissionRole === role}
								>
									{isSavingPermissionRole === role ? 'Saving...' : `Save ${role}`}
								</button>
							</div>
						</div>
					)
				})}
			</div>
		</section>
	)
}
