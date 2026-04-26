import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import LoadingButton from '../../widgets/LoadingButton';
import styles from './Login.module.css';

export default function ForgotPassword() {
	const { BASE_URL } = useContext(AuthContext);
	const navigate = useNavigate();
	const [email, setEmail] = useState('');
	const [message, setMessage] = useState({ text: '', type: '' });
	const [isSubmitting, setIsSubmitting] = useState(false);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage({ text: '', type: '' });

		if (!/\S+@\S+\.\S+/.test(email)) {
			setMessage({ text: 'Enter a valid email address', type: 'error' });
			return;
		}

		try {
			setIsSubmitting(true);
			const response = await fetch(`${BASE_URL}/api/auth/forgot-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email }),
			});

			const contentType = response.headers.get('content-type') || '';
			const data = contentType.includes('application/json')
				? await response.json()
				: { message: await response.text() };

			if (!response.ok) throw new Error(data.message || 'Failed to send reset email');

			setMessage({
				text: data.message || 'If an account exists for this email, a password reset link has been sent.',
				type: 'success',
			});
		} catch (error) {
			setMessage({ text: error.message, type: 'error' });
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Recover password</h1>
			<p className={styles.helperText}>
				Enter your email address and we&apos;ll send you a link to choose a new password.
			</p>

			<form onSubmit={handleSubmit} className={styles.form}>
				<input
					type="email"
					name="email"
					placeholder="Email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					required
					disabled={isSubmitting}
					autoComplete="email"
					className={styles.input}
				/>

				<LoadingButton
					type="submit"
					className={styles.loginButton}
					isLoading={isSubmitting}
					loadingLabel="Sending..."
					spinnerColor="#0C0E14"
				>
					Send reset link
				</LoadingButton>
			</form>

			{message.text && (
				<div className={`${styles.messageContainer} ${styles[`${message.type}Message`]}`}>
					<span className={`${styles.messageText} ${styles[`${message.type}Text`]}`}>
						{message.text}
					</span>
				</div>
			)}

			<div className={styles.actionGroup}>
				<button
					type="button"
					onClick={() => navigate('/')}
					disabled={isSubmitting}
					className={styles.secondaryButton}
				>
					Back to sign in
				</button>
			</div>
		</div>
	);
}
