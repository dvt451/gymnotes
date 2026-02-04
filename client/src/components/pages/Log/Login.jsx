import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import styles from './Login.module.css';
// import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
	const { login, BASE_URL } = useContext(AuthContext);
	const navigate = useNavigate();
	const [formData, setFormData] = useState({
		email: '',
		password: '',
		showPassword: false
	});
	const [message, setMessage] = useState({ text: '', type: '' });

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setMessage({ text: '', type: '' });

		if (!/\S+@\S+\.\S+/.test(formData.email)) {
			setMessage({ text: 'Введите корректный email', type: 'error' });
			return;
		}

		try {
			const response = await fetch(`${BASE_URL}/api/auth/login`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					email: formData.email,
					password: formData.password
				}),
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.message || 'Ошибка входа');

			login(data.token);
			navigate('/home');
		} catch (error) {
			setMessage({ text: error.message, type: 'error' });
		}
	};

	const handleGoogleSuccess = async (credentialResponse) => {
		try {
			const response = await fetch(`${BASE_URL}/api/auth/google`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ token: credentialResponse.credential }),
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.message || 'Ошибка Google-входа');

			login(data.token);
		} catch (error) {
			setMessage({ text: error.message, type: 'error' });
		}
	};

	const handleGoogleError = () => {
		setMessage({ text: 'Ошибка входа через Google', type: 'error' });
	};

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Вход</h1>

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
						type={formData.showPassword ? "text" : "password"}
						name="password"
						placeholder="Пароль"
						value={formData.password}
						onChange={handleChange}
						required
						className={styles.input}
					/>
					<button
						type="button"
						onClick={() => setFormData(prev => ({ ...prev, showPassword: !prev.showPassword }))}
						className={styles.passwordToggle}
					>
						{formData.showPassword ? '🙈' : '👁️'}
					</button>
				</div>

				<button type="submit" className={styles.loginButton}>
					Войти
				</button>
			</form>

			{message.text && (
				<div className={`${styles.messageContainer} ${styles[`${message.type}Message`]}`}>
					<span className={`${styles.messageText} ${styles[`${message.type}Text`]}`}>
						{message.text}
					</span>
				</div>
			)}

			<div className={styles.googleContainer}>
				{/* Google Login компонент */}
			</div>

			<button
				onClick={() => navigate('/register')}
				className={styles.registerLink}
			>
				Нет аккаунта? Зарегистрируйтесь
			</button>
		</div>
	);
}