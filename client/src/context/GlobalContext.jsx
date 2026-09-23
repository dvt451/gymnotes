// context/AuthContext.js
import React, { createContext, useState } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
	const [mainColor, setMainColor] = useState('#92E33C'); // РёР»Рё С†РІРµС‚ РїРѕ СѓРјРѕР»С‡Р°РЅРёСЋ
	const [adminBarState, setAdminBarState] = useState(false)
	const [timerDisplayState, setTimerDisplayState] = useState(false)
	const [showBurgerMenu, setShowBurgerMenu] = useState(false)

	// Р¤СѓРЅРєС†РёСЏ РґР»СЏ РёР·РјРµРЅРµРЅРёСЏ С†РІРµС‚Р°
	const handleColorChange = (e) => {
		const newColor = e.target.value;
		setMainColor(newColor);
		// Р—РґРµСЃСЊ РјРѕР¶РЅРѕ СЃРѕС…СЂР°РЅРёС‚СЊ С†РІРµС‚ РЅР° СЃРµСЂРІРµСЂРµ
		console.log('Color changed to:', newColor);
	};

	return (
		<GlobalContext.Provider value={{
			mainColor,
			setMainColor,
			handleColorChange,
			adminBarState,
			setAdminBarState,
			timerDisplayState,
			setTimerDisplayState,
			showBurgerMenu,
			setShowBurgerMenu,
		}}>
			{children}
		</GlobalContext.Provider>
	);
};
