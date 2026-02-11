import React, { useState, useEffect, useContext } from 'react';
import { nutritionsStyle } from "./nutritionsStyle";
import { colors, toRem, commonStyle } from "../../../../styles/commonStyle";
import nutritionBottle from "/img/nutritions/bottle.png";
import nutritionMeal from "/img/nutritions/meal.png";
import nutritionProtein from "/img/nutritions/protein.png";
import nutritionVitamin from "/img/nutritions/vitamin.png";
import { getToken } from '../../../utils/getToken';
import { AuthContext } from '../../../../context/AuthContext';
import NutritionControls from './NutritionControls';

export default function Nutritions() {
	const { BASE_URL } = useContext(AuthContext);
	const [editState, setEditState] = useState(false);
	const [nutritions, setNutritions] = useState({
		water: 0,
		meal: 0,
		protein: 0,
		vitamin: 0
	});
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		fetchNutritions();
	}, []);

	const fetchNutritions = async () => {
		try {
			const token = await getToken();
			const res = await fetch(`${BASE_URL}/api/nutritions`, {
				headers: {
					Authorization: `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				throw new Error('Ошибка загрузки данных');
			}

			const data = await res.json();
			setNutritions(data.nutritions);
		} catch (err) {
			console.error('Ошибка загрузки питания:', err);
		}
	};

	const incrementNutrition = async (type) => {
		try {
			setLoading(true);
			const token = await getToken();

			const res = await fetch(`${BASE_URL}/api/nutritions/increment`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ type }),
			});

			if (!res.ok) {
				throw new Error('Ошибка обновления');
			}

			const data = await res.json();
			setNutritions(data.nutritions);
		} catch (err) {
			console.error('Ошибка увеличения счетчика:', err);
			alert('Ошибка: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const decrementNutrition = async (type) => {
		try {
			setLoading(true);
			const token = await getToken();

			const res = await fetch(`${BASE_URL}/api/nutritions/decrement`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ type }),
			});

			if (!res.ok) {
				throw new Error('Ошибка обновления');
			}

			const data = await res.json();
			setNutritions(data.nutritions);
		} catch (err) {
			console.error('Ошибка уменьшения счетчика:', err);
			alert('Ошибка: ' + err.message);
		} finally {
			setLoading(false);
		}
	};

	const nutritionItems = [
		{ type: 'water', img: nutritionBottle, text: 'Water' },
		{ type: 'meal', img: nutritionMeal, text: 'Meal' },
		{ type: 'protein', img: nutritionProtein, text: 'Protein' },
		{ type: 'vitamin', img: nutritionVitamin, text: 'Vitamin' },
	];
	const handleToggleEdit = () => {
		setEditState(!editState);
	}
	return (
		<div style={nutritionsStyle.nutritions}>
			<div style={commonStyle.titleHeader}>
				<h2 style={commonStyle.title}>Nutritions</h2>
				<NutritionControls editState={editState} handleToggleEdit={handleToggleEdit} />
			</div>
			<div style={nutritionsStyle.nutritionsList}>
				{nutritionItems.map((item) => (
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
							onClick={() => { editState ? decrementNutrition(item.type) : incrementNutrition(item.type) }}
							disabled={loading}
						>
							{editState ? '-' : '+'}
						</button>
					</div>
				))}
			</div>
		</div >
	);
}