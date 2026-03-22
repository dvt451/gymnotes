export default function AdminLoginScreen({
	loginForm,
	message,
	isLoggingIn,
	onSubmit,
	onChange,
}) {
	return (
		<div className="admin-screen">
			<div className="admin-login-shell">
				<section className="admin-login-card">
					<p className="admin-eyebrow">Admin Access</p>
					<h1>GymNotes control surface</h1>
					<p className="admin-subtitle">
						Use an account with the <code>admin</code> role. If this is the first admin,
						promote one from the server with <code>npm run user:role --prefix server -- your@email admin</code>.
					</p>

					<form className="admin-login-form" onSubmit={onSubmit}>
						<label className="admin-field">
							<span>Email</span>
							<input
								autoComplete="email"
								name="email"
								type="email"
								value={loginForm.email}
								onChange={onChange}
								placeholder="admin@gymnotes.app"
								required
							/>
						</label>

						<label className="admin-field">
							<span>Password</span>
							<input
								autoComplete="current-password"
								name="password"
								type="password"
								value={loginForm.password}
								onChange={onChange}
								placeholder="Enter password"
								required
							/>
						</label>

						<button className="admin-primary-button" disabled={isLoggingIn} type="submit">
							{isLoggingIn ? 'Signing in...' : 'Sign in as admin'}
						</button>
					</form>

					{message?.text ? (
						<p className={`admin-message admin-message-${message.type}`}>{message.text}</p>
					) : null}
				</section>
			</div>
		</div>
	)
}
