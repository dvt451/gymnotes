import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';
import styles from './Login.module.css';

export default function Login() {
	const { login, BASE_URL } = useContext(AuthContext);
	const navigate = useNavigate();
	const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		showPassword: false,
	});
	const [message, setMessage] = useState({ text: '', type: '' });

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage({ text: '', type: '' });

		if (!/\S+@\S+\.\S+/.test(formData.email)) {
			setMessage({ text: 'Enter a valid email address', type: 'error' });
			return;
		}

		try {
			const response = await fetch(`${BASE_URL}/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: formData.email,
					password: formData.password,
				}),
			});

			const contentType = response.headers.get('content-type') || '';
			const data = contentType.includes('application/json')
				? await response.json()
				: { message: await response.text() };

			if (!response.ok) throw new Error(data.message || 'Login failed');
			if (!data?.token) throw new Error('Token was not returned by the server');

			await login(data.token);
		} catch (error) {
			setMessage({ text: error.message, type: 'error' });
		}
	};

	const handleGoogleLogin = async (googleToken) => {
		setMessage({ text: '', type: '' });

		try {
			const response = await fetch(`${BASE_URL}/api/auth/google`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: googleToken }),
			});

			const contentType = response.headers.get('content-type') || '';
			const data = contentType.includes('application/json')
				? await response.json()
				: { message: await response.text() };

			if (!response.ok) throw new Error(data.message || 'Google login failed');
			if (!data?.token) throw new Error('Token was not returned by the server');

			await login(data.token);
		} catch (error) {
			setMessage({ text: error.message, type: 'error' });
		}
	};

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Login</h1>

			<form onSubmit={handleSubmit} className={styles.form}>
				<input
					type="email"
					name="email"
					placeholder="Email"
					value={formData.email}
					onChange={handleChange}
					required
					className={styles.input}
				/>

				<div className={styles.passwordContainer}>
					<input
						type={formData.showPassword ? 'text' : 'password'}
						name="password"
						placeholder="Password"
						value={formData.password}
						onChange={handleChange}
						required
						className={styles.input}
					/>
					<button
						type="button"
						onClick={() =>
							setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }))
						}
						className={styles.passwordToggle}
					>
						{formData.showPassword ? 'Hide' : 'Show'}
					</button>
				</div>

				<button type="submit" className={styles.loginButton}>
					Sign in
				</button>
			</form>

			{message.text && (
				<div className={`${styles.messageContainer} ${styles[`${message.type}Message`]}`}>
					<span className={`${styles.messageText} ${styles[`${message.type}Text`]}`}>
						{message.text}
					</span>
				</div>
			)}

			{googleClientId && (
				<div className={styles.divider}>
					<div className={styles.dividerLine}></div>
					<span className={styles.dividerText}>or</span>
					<div className={styles.dividerLine}></div>
				</div>
			)}

			<div className={styles.googleContainer}>
				<GoogleAuthButton
					clientId={googleClientId}
					text="signin_with"
					onCredential={handleGoogleLogin}
					onError={(error) =>
						setMessage({
							text: error?.message || 'Failed to sign in with Google',
							type: 'error',
						})
					}
				/>
			</div>

			<button onClick={() => navigate('/register')} className={styles.registerLink}>
				No account yet? Create one
			</button>
		</div>
	);
}
