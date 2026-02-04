// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [isLoading, setIsLoading] = useState(true);
	const [userToken, setUserToken] = useState(null);
	const [user, setUser] = useState({});
	const navigate = useNavigate();
	const BASE_URL = import.meta.env.VITE_API_URL;

	// Аналог getToken для web
	const getToken = () => localStorage.getItem('token');

	// Проверка авторизации
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const token = getToken();
				if (!token) {
					setIsLoading(false);
					return;
				}

				// Проверяем токен на сервере
				const response = await axios.get(`${BASE_URL}/api/auth/me`, {
					headers: { 'Authorization': `Bearer ${token}` }
				});

				if (response.data) {
					setUserToken(token);
					setUser(response.data);
					// Если на странице логина, редиректим на home
					if (window.location.pathname === '/') {
						navigate('/home');
					}
				} else {
					// Токен невалидный
					localStorage.removeItem('token');
				}
			} catch (err) {
				console.error('Ошибка проверки авторизации:', err);
				localStorage.removeItem('token');
			} finally {
				setIsLoading(false);
			}
		};

		checkAuth();
	}, [navigate]);

	const login = async (token) => {
		setIsLoading(true);
		localStorage.setItem('token', token);
		setUserToken(token);

		// Получаем данные пользователя
		try {
			const response = await axios.get(`${BASE_URL}/api/auth/me`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			setUser(response.data);
		} catch (err) {
			console.error('Ошибка получения данных пользователя:', err);
		}

		setIsLoading(false);
		navigate('/home'); // Редирект после логина
	};

	const logout = async () => {
		setIsLoading(true);
		localStorage.removeItem('token');
		setUserToken(null);
		setUser({});
		setIsLoading(false);
		navigate('/');
	};

	const isLoggedIn = () => {
		return !!userToken;
	};

	return (
		<AuthContext.Provider value={{
			BASE_URL,
			user,
			login,
			logout,
			isLoading,
			userToken,
			setUser,
			getToken,
			isLoggedIn
		}}>
			{children}
		</AuthContext.Provider>
	);
};