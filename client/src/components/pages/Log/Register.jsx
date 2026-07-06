import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import GoogleAuthButton from './GoogleAuthButton';
import LoadingButton from '../../widgets/LoadingButton';
import styles from './Register.module.css';
import { colors } from '../../../styles/commonStyle';

export default function Register() {
	const [formData, setFormData] = useState({
		name: '',
		weight: '',
		email: '',
		password: '',
	});
	const [message, setMessage] = useState({ text: '', type: '' });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const { BASE_URL, login } = useContext(AuthContext);
	const navigate = useNavigate();
	const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setMessage({ text: '', type: '' });

		try {
			setIsSubmitting(true);
			const res = await fetch(`${BASE_URL}/api/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			const contentType = res.headers.get('content-type') || '';
			const data = contentType.includes('application/json')
				? await res.json()
				: { message: await res.text() };

			if (!res.ok) {
				throw new Error(data.message || 'Registration failed');
			}

			setMessage({ text: 'Account created successfully', type: 'success' });
			setTimeout(() => navigate('/'), 1500);
		} catch (error) {
			setMessage({ text: error.message, type: 'error' });
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleGoogleRegister = async (googleToken) => {
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

			if (!response.ok) throw new Error(data.message || 'Google sign up failed');
			if (!data?.token) throw new Error('Token was not returned by the server');

			await login(data.token);
		} catch (error) {
			setMessage({ text: error.message, type: 'error' });
		}
	};

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Register</h1>

			<form onSubmit={handleRegister} className={styles.form}>
				<input
					type="text"
					name="name"
					placeholder="Name"
					value={formData.name}
					onChange={handleChange}
					required
					disabled={isSubmitting}
					className={styles.input}
				/>
				<input
					type="number"
					name="weight"
					placeholder="Weight"
					value={formData.weight}
					onChange={handleChange}
					required
					disabled={isSubmitting}
					className={styles.input}
				/>
				<input
					type="email"
					name="email"
					placeholder="Email"
					value={formData.email}
					onChange={handleChange}
					required
					disabled={isSubmitting}
					className={styles.input}
				/>
				<input
					type="password"
					name="password"
					placeholder="Password"
					value={formData.password}
					onChange={handleChange}
					required
					disabled={isSubmitting}
					className={styles.input}
				/>
				<LoadingButton
					type="submit"
					className={styles.button}
					isLoading={isSubmitting}
					loadingLabel="Creating account..."
					spinnerColor={colors.blueDark}

				>
					Create account
				</LoadingButton>
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
					text="signup_with"
					onCredential={handleGoogleRegister}
					onError={(error) =>
						setMessage({
							text: error?.message || 'Failed to sign up with Google',
							type: 'error',
						})
					}
				/>
			</div>

			<button onClick={() => navigate('/')} className={styles.link}>
				Already have an account? Sign in
			</button>
		</div>
	);
}
