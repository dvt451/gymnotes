// context/AuthContext.js
import React, { createContext, useEffect, useState } from 'react';

export const GlobalContext = createContext();

const readStoredBoolean = (key, fallbackValue) => {
	try {
		const storedValue = localStorage.getItem(key);
		if (storedValue === null) return fallbackValue;
		return storedValue === 'true';
	} catch (error) {
		console.error(`Failed to read "${key}" from localStorage:`, error);
		return fallbackValue;
	}
};

export const GlobalProvider = ({ children }) => {
	const [mainColor, setMainColor] = useState('#92E33C'); // РёР»Рё С†РІРµС‚ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
	const [showScheduleSection, setShowScheduleSection] = useState(() => readStoredBoolean('showScheduleSection', true));
	const [showNutritionSection, setShowNutritionSection] = useState(() => readStoredBoolean('showNutritionSection', true));
	const [adminBarState, setAdminBarState] = useState(false)

	// Р¤СѓРЅРєС†РёСЏ РґР»СЏ РёР·РјРµРЅРµРЅРёСЏ С†РІРµС‚Р°
	const handleColorChange = (e) => {
		const newColor = e.target.value;
		setMainColor(newColor);
		// Р—РґРµСЃСЊ РјРѕР¶РЅРѕ СЃРѕС…СЂР°РЅРёС‚СЊ С†РІРµС‚ РЅР° СЃРµСЂРІРµСЂРµ
		console.log('Color changed to:', newColor);
	};

	useEffect(() => {
		localStorage.setItem('showScheduleSection', String(showScheduleSection));
	}, [showScheduleSection]);

	useEffect(() => {
		localStorage.setItem('showNutritionSection', String(showNutritionSection));
	}, [showNutritionSection]);

	return (
		<GlobalContext.Provider value={{
			mainColor,
			setMainColor,
			handleColorChange,
			showScheduleSection,
			setShowScheduleSection,
			showNutritionSection,
			setShowNutritionSection,
			adminBarState,
			setAdminBarState
		}}>
			{children}
		</GlobalContext.Provider>
	);
};
