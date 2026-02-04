// utils/getToken.js
export const getToken = () => {
	try {
		// Используем синхронный localStorage вместо асинхронного AsyncStorage
		const token = localStorage.getItem('token');
		return token;
	} catch (err) {
		console.error('Ошибка получения токена', err);
		return null;
	}
};

// Асинхронная версия (если нужна для совместимости с существующим кодом)
export const getTokenAsync = async () => {
	return getToken(); // Просто возвращаем результат синхронной функции
};