// context/AuthContext.js
import React, { createContext, useState } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {

	const [mainColor, setMainColor] = useState('#92E33C'); // или цвет по умолчанию

	// Функция для изменения цвета
	const handleColorChange = (e) => {
		const newColor = e.target.value;
		setMainColor(newColor);
		// Здесь можно сохранить цвет на сервере
		console.log('Color changed to:', newColor);
	};


	return (
		<GlobalContext.Provider value={{
			mainColor,
			setMainColor,
			handleColorChange
		}}>
			{children}
		</GlobalContext.Provider>
	);
};