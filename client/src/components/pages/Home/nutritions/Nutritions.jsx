import React from 'react'
import { nutritionsStyle } from "./nutritionsStyle";
import { colors, toRem, commonStyle } from "../../../../styles/commonStyle";
import nutritionBottle from "/img/nutritions/bottle.png";
import nutritionMeal from "/img/nutritions/meal.png";
import nutritionProtein from "/img/nutritions/protein.png";
import nutritionVitamin from "/img/nutritions/vitamin.png";

export default function Nutritions() {
	return (
		<div style={nutritionsStyle.nutritions}>
			<div style={commonStyle.titleHeader}>
				<h2 style={commonStyle.title}>Nutritions</h2>
			</div>
			<div style={nutritionsStyle.nutritionsList}>
				<div style={nutritionsStyle.nutritionItem}>
					<div style={nutritionsStyle.nutritionItemHeader}>
						<img src={nutritionBottle} alt="" style={nutritionsStyle.nutritionItemImg} />
						<div style={nutritionsStyle.nutritionItemNumber}>3</div>
					</div>
					<p style={nutritionsStyle.nutritionItemText}>Water</p>
					<button style={nutritionsStyle.nutritionItemButton}>+</button>
				</div>
				<div style={nutritionsStyle.nutritionItem}>
					<div style={nutritionsStyle.nutritionItemHeader}>
						<img src={nutritionMeal} alt="" style={nutritionsStyle.nutritionItemImg} />
						<div style={nutritionsStyle.nutritionItemNumber}>3</div>
					</div>
					<p style={nutritionsStyle.nutritionItemText}>Meal</p>
					<button style={nutritionsStyle.nutritionItemButton}>+</button>
				</div>

				<div style={nutritionsStyle.nutritionItem}>
					<div style={nutritionsStyle.nutritionItemHeader}>
						<img src={nutritionProtein} alt="" style={nutritionsStyle.nutritionItemImg} />
						<div style={nutritionsStyle.nutritionItemNumber}>3</div>
					</div>
					<p style={nutritionsStyle.nutritionItemText}>Protein</p>
					<button style={nutritionsStyle.nutritionItemButton}>+</button>
				</div>
				<div style={nutritionsStyle.nutritionItem}>
					<div style={nutritionsStyle.nutritionItemHeader}>
						<img src={nutritionVitamin} alt="" style={nutritionsStyle.nutritionItemImg} />
						<div style={nutritionsStyle.nutritionItemNumber}>3</div>
					</div>
					<p style={nutritionsStyle.nutritionItemText}>Vitamin</p>
					<button style={nutritionsStyle.nutritionItemButton}>+</button>
				</div>
			</div>
		</div>
	)
}
