import React, { useContext, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';

export default function Menu({ menuState }) {
	const { BASE_URL, logout, setUser, user } = useContext(AuthContext);

	const [newName, setNewName] = useState('');
	const [newWeight, setNewWeight] = useState('');

	const editProfile = async () => {
		const updatedProfile = {
			name: newName,
			weight: newWeight,
		};

		try {
			const token = localStorage.getItem('token'); // пример получения токена, адаптируй под себя
			const res = await fetch(`${BASE_URL}/api/auth/profile`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify(updatedProfile),
			});

			if (!res.ok) {
				const text = await res.text();
				console.error('Ошибка от сервера при обновлении профиля:', res.status, text);
				return;
			}

			const updated = await res.json();
			setUser(updated);
		} catch (err) {
			console.error('Ошибка обновления профиля:', err);
		}
	};

	return (
		<div className={menuState ? 'menu _active' : 'menu'}>
			<div className='menu__profile' >
				<img
					src={'/user.png'}
					alt="User Avatar"
				/>
				<h2 className='menu__name'>{user.name || 'Unknown'}</h2>
			</div>

			<div className='menu__input-row'>
				<label className='menu__input-label'>Name: {user.name}</label>
				<input
					type="text"
					value={newName}
					onChange={(e) => setNewName(e.target.value)}
					placeholder="New Name"
					className='menu__input'
				/>
			</div>

			<div className='menu__input-row'>
				<label className='menu__input-label'>Weight: {user.weight}</label>
				<input
					type="number"
					value={newWeight}
					onChange={(e) => setNewWeight(e.target.value)}
					placeholder="New Weight"
					className='menu__input'
				/>
			</div>

			<button onClick={editProfile} className='menu__save-button'>
				💾 Сохранить
			</button>

			<button onClick={logout} className='menu__logout-button'>
				🚪 Выйти
			</button>
		</div>
	);
}


