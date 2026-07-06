import React, { useContext, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import LoadingButton from '../../widgets/LoadingButton';
import styles from './Login.module.css';
import { colors } from '../../../styles/commonStyle';

export default function ResetPassword() {
	const { BASE_URL } = useContext(AuthContext);
	const navigate = useNavigate();
	const { token } = useParams();
	const [formData, setFormData] = useState({
		password: '',
		confirmPassword: '',
		showPassword: false,
		showConfirmPassword: false,
	});
	const [message, setMessage] = useState({ text: '', type: '' });
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [isSuccess, setIsSuccess] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prev) => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage({ text: '', type: '' });

		if (!token) {
			setMessage({ text: 'This password reset link is missing a token', type: 'error' });
			return;
		}

		if (formData.password.length < 6) {
			setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
			return;
		}

		if (formData.password !== formData.confirmPassword) {
			setMessage({ text: 'Passwords do not match', type: 'error' });
			return;
		}

		try {
			setIsSubmitting(true);
			const response = await fetch(`${BASE_URL}/api/auth/reset-password`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					token,
					password: formData.password,
				}),
			});

			const contentType = response.headers.get('content-type') || '';
			const data = contentType.includes('application/json')
				? await response.json()
				: { message: await response.text() };

			if (!response.ok) throw new Error(data.message || 'Failed to reset password');

			setIsSuccess(true);
			setFormData({
				password: '',
				confirmPassword: '',
				showPassword: false,
				showConfirmPassword: false,
			});
			setMessage({
				text: data.message || 'Password reset successfully. You can now sign in.',
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
			<h1 className={styles.title}>Set new password</h1>
			<p className={styles.helperText}>
				Choose a new password for your account. This reset link expires after 30 minutes.
			</p>

			<form onSubmit={handleSubmit} className={styles.form}>
				<div className={styles.passwordContainer}>
					<input
						type={formData.showPassword ? 'text' : 'password'}
						name="password"
						placeholder="New password"
						value={formData.password}
						onChange={handleChange}
						required
						disabled={isSubmitting || isSuccess}
						autoComplete="new-password"
						className={styles.input}
					/>
					<button
						type="button"
						onClick={() =>
							setFormData((prev) => ({ ...prev, showPassword: !prev.showPassword }))
						}
						disabled={isSubmitting || isSuccess}
						className={styles.passwordToggle}
					>
						{formData.showPassword ? 'Hide' : 'Show'}
					</button>
				</div>

				<div className={styles.passwordContainer}>
					<input
						type={formData.showConfirmPassword ? 'text' : 'password'}
						name="confirmPassword"
						placeholder="Confirm new password"
						value={formData.confirmPassword}
						onChange={handleChange}
						required
						disabled={isSubmitting || isSuccess}
						autoComplete="new-password"
						className={styles.input}
					/>
					<button
						type="button"
						onClick={() =>
							setFormData((prev) => ({
								...prev,
								showConfirmPassword: !prev.showConfirmPassword,
							}))
						}
						disabled={isSubmitting || isSuccess}
						className={styles.passwordToggle}
					>
						{formData.showConfirmPassword ? 'Hide' : 'Show'}
					</button>
				</div>

				<LoadingButton
					type="submit"
					className={styles.loginButton}
					isLoading={isSubmitting}
					loadingLabel="Saving..."
					spinnerColor={colors.blueDark}

				>
					Save new password
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
					className={styles.secondaryButton}
				>
					Back to sign in
				</button>
			</div>
		</div>
	);
}
