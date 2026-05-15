import React, { useState, useEffect, useContext, useCallback } from 'react';
import { createNutritionsStyle } from "./nutritionsStyle";
import { colors, createCommonStyle } from "../../../../styles/commonStyle";
import nutritionBottle from "/img/nutritions/bottle.png";
import nutritionMeal from "/img/nutritions/meal.png";
import nutritionProtein from "/img/nutritions/protein.png";
import nutritionVitamin from "/img/nutritions/vitamin.png";
import { getToken } from '../../../utils/getToken';
import { AuthContext } from '../../../../context/AuthContext';
import NutritionControls from './NutritionControls';
import { GlobalContext } from '../../../../context/GlobalContext';
import InlineSpinner from '../../../widgets/InlineSpinner';

export default function Nutritions() {
	const { BASE_URL } = useContext(AuthContext);
	const { mainColor } = useContext(GlobalContext);
	const [editState, setEditState] = useState(false);
	const [nutritions, setNutritions] = useState({
		water: 0,
		meal: 0,
		protein: 0,
		vitamin: 0
	});
	const [isInitialLoading, setIsInitialLoading] = useState(true);
	const [loading, setLoading] = useState(false);
	const [activeNutritionType, setActiveNutritionType] = useState('');

	const nutritionsStyle = createNutritionsStyle(mainColor);
	const commonStyle = createCommonStyle(mainColor);

	const fetchNutritions = useCallback(async () => {
		setIsInitialLoading(true);

		try {
			const token = await getToken();
			const res = await fetch(`${BASE_URL}/api/nutritions`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				throw new Error('Failed to load nutritions');
			}

			const data = await res.json();
			setNutritions(data.nutritions);
		} catch (err) {
			console.error('Failed to load nutritions:', err);
		} finally {
			setIsInitialLoading(false);
		}
	}, [BASE_URL]);

	useEffect(() => {
		fetchNutritions();
	}, [fetchNutritions]);

	const updateNutrition = async (type, mode) => {
		try {
			setLoading(true);
			setActiveNutritionType(type);
			const token = await getToken();

			const res = await fetch(`${BASE_URL}/api/nutritions/${mode}`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ type }),
			});

			if (!res.ok) {
				throw new Error('Failed to update nutrition');
			}

			const data = await res.json();
			setNutritions(data.nutritions);
		} catch (err) {
			console.error(`Failed to ${mode} nutrition:`, err);
			alert(`Error: ${err.message}`);
		} finally {
			setLoading(false);
			setActiveNutritionType('');
		}
	};

	const nutritionItems = [
		{ type: 'water', img: nutritionBottle, text: 'Water' },
		{ type: 'meal', img: nutritionMeal, text: 'Meal' },
		{ type: 'protein', img: nutritionProtein, text: 'Protein' },
		{ type: 'vitamin', img: nutritionVitamin, text: 'Vitamin' },
	];

	return (
		<div style={commonStyle.commonSection}>
			<div style={commonStyle.titleHeader}>
				<h2 style={commonStyle.title}>Nutritions</h2>
				<NutritionControls
					editState={editState}
					handleToggleEdit={() => setEditState((prev) => !prev)}
				/>
			</div>

			{isInitialLoading ? (
				<div style={nutritionsStyle.nutritionsList}>
					{nutritionItems.map((item) => (
						<div
							key={`nutrition-skeleton-${item.type}`}
							style={{ ...nutritionsStyle.nutritionItem, minWidth: '110px', flex: '1 1 0' }}
						>
							<div className="ui-skeleton" style={{ width: '100%', height: '52px', borderRadius: '12px' }}></div>
							<div className="ui-skeleton" style={{ width: '58%', height: '18px', alignSelf: 'center' }}></div>
							<div className="ui-skeleton" style={{ width: '100%', height: '48px', borderRadius: '10px' }}></div>
						</div>
					))}
				</div>
			) : (
				<div style={nutritionsStyle.nutritionsList}>
					{nutritionItems.map((item) => {
						const isItemLoading = loading && activeNutritionType === item.type;

						return (
							<div key={item.type} style={nutritionsStyle.nutritionItem}>
								<div style={nutritionsStyle.nutritionItemHeader}>
									<img src={item.img} alt="" style={nutritionsStyle.nutritionItemImg} />
									<div style={nutritionsStyle.nutritionItemNumber}>
										{nutritions[item.type]}
									</div>
								</div>
								<p style={nutritionsStyle.nutritionItemText}>{item.text}</p>
								<button
									style={{
										...nutritionsStyle.nutritionItemButton,
										...(editState && nutritionsStyle.nutritionItemButtonEdit)
									}}
									onClick={() => updateNutrition(item.type, editState ? 'decrement' : 'increment')}
									disabled={loading}
								>
									{isItemLoading ? (
										<InlineSpinner size={22} thickness={2.5} color={colors.black} />
									) : (
										editState ? '-' : '+'
									)}
								</button>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
