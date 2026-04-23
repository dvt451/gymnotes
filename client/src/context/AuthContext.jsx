// context/AuthContext.js
import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
	const [isBootstrapping, setIsBootstrapping] = useState(true);
	const [userToken, setUserToken] = useState(null);
	const [user, setUser] = useState({});
	const navigate = useNavigate();
	const BASE_URL = import.meta.env.VITE_API_URL;

	// РђРЅР°Р»РѕРі getToken РґР»СЏ web
	const getToken = () => localStorage.getItem('token');

	// РџСЂРѕРІРµСЂРєР° Р°РІС‚РѕСЂРёР·Р°С†РёРё
	useEffect(() => {
		const checkAuth = async () => {
			try {
				const token = getToken();
				if (!token) {
					setIsBootstrapping(false);
					return;
				}

				// РџСЂРѕРІРµСЂСЏРµРј С‚РѕРєРµРЅ РЅР° СЃРµСЂРІРµСЂРµ
				const response = await axios.get(`${BASE_URL}/api/auth/me`, {
					headers: { 'Authorization': `Bearer ${token}` }
				});

				if (response.data) {
					setUserToken(token);
					setUser(response.data);
					// Р•СЃР»Рё РЅР° СЃС‚СЂР°РЅРёС†Рµ Р»РѕРіРёРЅР°, СЂРµРґРёСЂРµРєС‚РёРј РЅР° home
					if (window.location.pathname === '/') {
						navigate('/home');
					}
				} else {
					// РўРѕРєРµРЅ РЅРµРІР°Р»РёРґРЅС‹Р№
					localStorage.removeItem('token');
				}
			} catch (err) {
				console.error('РћС€РёР±РєР° РїСЂРѕРІРµСЂРєРё Р°РІС‚РѕСЂРёР·Р°С†РёРё:', err);
				localStorage.removeItem('token');
			} finally {
				setIsBootstrapping(false);
			}
		};

		checkAuth();
	}, [BASE_URL, navigate]);

	const login = async (token) => {
		localStorage.setItem('token', token);
		setUserToken(token);

		// РџРѕР»СѓС‡Р°РµРј РґР°РЅРЅС‹Рµ РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ
		try {
			const response = await axios.get(`${BASE_URL}/api/auth/me`, {
				headers: { 'Authorization': `Bearer ${token}` }
			});
			setUser(response.data);
		} catch (err) {
			console.error('РћС€РёР±РєР° РїРѕР»СѓС‡РµРЅРёСЏ РґР°РЅРЅС‹С… РїРѕР»СЊР·РѕРІР°С‚РµР»СЏ:', err);
		}

		navigate('/home'); // Р РµРґРёСЂРµРєС‚ РїРѕСЃР»Рµ Р»РѕРіРёРЅР°
	};

	const logout = async () => {
		localStorage.removeItem('token');
		setUserToken(null);
		setUser({});
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
			isLoading: isBootstrapping,
			isBootstrapping,
			userToken,
			setUser,
			getToken,
			isLoggedIn
		}}>
			{children}
		</AuthContext.Provider>
	);
};
