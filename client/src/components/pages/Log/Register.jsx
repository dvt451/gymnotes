import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
// import { GoogleLogin } from '@react-oauth/google';
import { AuthContext } from '../../../context/AuthContext';
import styles from './Register.module.css';

export default function Register() {
	const [formData, setFormData] = useState({
		name: '',
		weight: '',
		email: '',
		password: ''
	});
	const [message, setMessage] = useState({ text: '', type: '' });
	const { BASE_URL } = useContext(AuthContext);
	const navigate = useNavigate();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleRegister = async (e) => {
		e.preventDefault();
		setMessage({ text: '', type: '' });

		try {
			const res = await fetch(`${BASE_URL}/api/auth/register`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData),
			});

			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'Ошибка регистрации');
			}

			setMessage({ text: 'Вы успешно зарегистрированы!', type: 'success' });
			setTimeout(() => navigate('/'), 1500);
		} catch (error) {
			setMessage({ text: error.message, type: 'error' });
		}
	};

	// const handleGoogleRegister = async (credentialResponse) => {
	// 	try {
	// 		const res = await fetch(`${BASE_URL}/api/auth/google`, {
	// 			method: 'POST',
	// 			headers: { 'Content-Type': 'application/json' },
	// 			body: JSON.stringify({ token: credentialResponse.credential }),
	// 		});

	// 		if (!res.ok) throw new Error('Ошибка Google-регистрации');

	// 		const data = await res.json();
	// 		localStorage.setItem('token', data.token);

	// 		setMessage({ text: 'Вы вошли через Google', type: 'success' });
	// 		setTimeout(() => navigate('/home'), 1500);
	// 	} catch (error) {
	// 		setMessage({ text: 'Не удалось войти через Google', type: 'error' });
	// 	}
	// };

	return (
		<div className={styles.container}>
			<h1 className={styles.title}>Регистрация</h1>

			<form onSubmit={handleRegister} className={styles.form}>
				<input
					type="text"
					name="name"
					placeholder="Name"
					value={formData.name}
					onChange={handleChange}
					required
					className={styles.input}
				/>
				<input
					type="number"
					name="weight"
					placeholder="Weight"
					value={formData.weight}
					onChange={handleChange}
					required
					className={styles.input}
				/>
				<input
					type="email"
					name="email"
					placeholder="Email"
					value={formData.email}
					onChange={handleChange}
					required
					className={styles.input}
				/>
				<input
					type="password"
					name="password"
					placeholder="Пароль"
					value={formData.password}
					onChange={handleChange}
					required
					className={styles.input}
				/>
				<button type="submit" className={styles.button}>
					Зарегистрироваться
				</button>
			</form>

			{message.text && (
				<div className={`${styles.messageContainer} ${styles[`${message.type}Message`]}`}>
					<span className={`${styles.messageText} ${styles[`${message.type}Text`]}`}>
						{message.text}
					</span>
				</div>
			)}

			{/* <div className={styles.divider}>
        <div className={styles.dividerLine}></div>
        <span className={styles.dividerText}>или</span>
        <div className={styles.dividerLine}></div>
      </div>

      <div className={styles.googleContainer}>
        <GoogleLogin
          onSuccess={handleGoogleRegister}
          onError={() => setMessage({ text: 'Ошибка входа через Google', type: 'error' })}
          text="signup_with"
          shape="rectangular"
          size="large"
        />
      </div> */}

			<button
				onClick={() => navigate('/')}
				className={styles.link}
			>
				Уже есть аккаунт? Войти
			</button>
		</div>
	);
}