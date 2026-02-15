import React, { useContext } from 'react'
import { createProfileStyles } from './profileStyles';
import { GlobalContext } from '../../../context/GlobalContext';

export default function ProfileMainColorSelector() {
	const { mainColor, setMainColor, handleColorChange } = useContext(GlobalContext);
	const profileStyles = createProfileStyles(mainColor);
	const presetColors = [
		'#ff8c00', '#ff0000', '#00ff00', '#0000ff',
		'#ffff00', '#ff00ff', '#00ffff', '#000000',
		'#ffffff', '#808080', '#800000', '#008000'
	];
	return (
		<div style={{ ...profileStyles.infoRow, ...{ justifyContent: 'space-between' } }}>
			<span style={profileStyles.infoLabel}>App main color</span>
			{/* Color input с предустановленными цветами */}
			<div style={{ ...profileStyles.infoRow, ...{ flexDirection: 'column', alignItems: 'flex-start', gap: '10px' } }}>
				{/* Основной color picker */}
				<div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%' }}>
					<input
						type="color"
						value={mainColor}
						onChange={handleColorChange}
						style={profileStyles.colorInputLarge}
					/>
				</div>

				{/* Предустановленные цвета */}
				{/* <div style={profileStyles.colorPalette}>
					{presetColors.map(color => (
						<div
							key={color}
							onClick={() => {
								setMainColor(color);
								console.log('Color selected:', color);
							}}
							style={{
								...profileStyles.colorPaletteItem,
								backgroundColor: color,
								borderColor: mainColor === color ? '#ff8c00' : 'transparent',
								boxShadow: mainColor === color ? '0 0 0 2px rgba(255,140,0,0.3)' : 'none'
							}}
						/>
					))}
				</div> */}
			</div>
		</div>
	)
}
