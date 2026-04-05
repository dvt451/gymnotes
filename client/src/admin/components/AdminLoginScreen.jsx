import { useState } from 'react'
import GoogleAuthButton from '../../components/pages/Log/GoogleAuthButton.jsx'

export default function AdminLoginScreen({
	loginForm,
	message,
	isLoggingIn,
	isGoogleLoggingIn,
	googleClientId,
	onSubmit,
	onChange,
	onGoogleCredential,
	onGoogleError,
}) {
	const [isPasswordVisible, setIsPasswordVisible] = useState(false)

	return (
		<div className="admin-screen">
			<div className="admin-login-shell">
				<section className="admin-login-aside">
					<p className="admin-eyebrow">Console Access</p>
					<h1>GymNotes control surface</h1>
					<p className="admin-subtitle">
						One place to review users, lock down permissions, restore backups, and trace admin activity with less friction.
					</p>

					<div className="admin-login-feature-list" aria-hidden="true">
						<div className="admin-login-feature">
							<span className="admin-login-feature-label">Accounts</span>
							<strong>Moderate users and roles</strong>
							<p>Handle access changes, suspensions, and restores without leaving the console.</p>
						</div>
						<div className="admin-login-feature">
							<span className="admin-login-feature-label">Resilience</span>
							<strong>Protect production data</strong>
							<p>Export a clean JSON snapshot before risky changes and restore from it when needed.</p>
						</div>
						<div className="admin-login-feature">
							<span className="admin-login-feature-label">Audit</span>
							<strong>Keep decisions traceable</strong>
							<p>Review the admin trail to confirm who changed access, data, and system state.</p>
						</div>
					</div>
				</section>

				<section className="admin-login-card">
					<p className="admin-eyebrow">Secure Sign-In</p>
					<h2 className="admin-login-title">Use a privileged account</h2>
					<p className="admin-subtitle">
						Use an account that has admin-console permissions. By default that includes <code>admin</code>, <code>moderator</code>, and <code>trainee</code>. If this is the first privileged account, promote one from the server with <code>npm run user:role --prefix server -- your@email admin</code>.
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
								disabled={isLoggingIn || isGoogleLoggingIn}
								required
							/>
						</label>

						<label className="admin-field">
							<span>Password</span>
							<div className="admin-password-field">
								<input
									autoComplete="current-password"
									name="password"
									type={isPasswordVisible ? 'text' : 'password'}
									value={loginForm.password}
									onChange={onChange}
									placeholder="Enter password"
									disabled={isLoggingIn || isGoogleLoggingIn}
									required
								/>
								<button
									type="button"
									className="admin-password-toggle"
									onClick={() => setIsPasswordVisible((current) => !current)}
									disabled={isLoggingIn || isGoogleLoggingIn}
									aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
								>
									{isPasswordVisible ? 'Hide' : 'Show'}
								</button>
							</div>
						</label>

						<button className="admin-primary-button" disabled={isLoggingIn || isGoogleLoggingIn} type="submit">
							{isLoggingIn ? 'Signing in...' : 'Sign in as admin'}
						</button>
					</form>

					{googleClientId ? (
						<>
							<div className="admin-login-divider">
								<span>or continue with Google</span>
							</div>

							<div className={`admin-google-auth ${isGoogleLoggingIn ? 'is-busy' : ''}`}>
								<GoogleAuthButton
									clientId={googleClientId}
									onCredential={onGoogleCredential}
									onError={onGoogleError}
									text="signin_with"
								/>
								{isGoogleLoggingIn ? (
									<p className="admin-google-auth-note">Finishing Google admin sign-in...</p>
								) : null}
							</div>
						</>
					) : null}

					{message?.text ? (
						<p className={`admin-message admin-message-${message.type}`}>{message.text}</p>
					) : null}
				</section>
			</div>
		</div>
	)
}
