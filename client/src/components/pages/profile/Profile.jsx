import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Header from '../../widgets/Header';
import Footer from '../../widgets/Footer';
import { createProfileStyles } from './profileStyles';
import { createCommonStyle } from '../../../styles/commonStyle';
import { FaCheck, FaTimes } from "react-icons/fa";
import { GlobalContext } from '../../../context/GlobalContext';
import ProfileMainColorSelector from './ProfileMainColorSelector';

// Компонент уведомления
const Notification = ({ message, type, onClose }) => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		if (message) {
			setIsVisible(true);
			const timer = setTimeout(() => {
				setIsVisible(false);
				setTimeout(onClose, 300); // Даем время на анимацию исчезновения
			}, 2700);

			return () => clearTimeout(timer);
		}
	}, [message, onClose]);

	if (!message || !isVisible) return null;

	return (
		<div style={{
			position: 'fixed',
			top: '20px',
			right: '20px',
			backgroundColor: type === 'success' ? '#4CAF50' : '#f44336',
			color: 'white',
			padding: '15px 20px',
			borderRadius: '8px',
			boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
			zIndex: 9999,
			display: 'flex',
			alignItems: 'center',
			justifyContent: 'space-between',
			gap: '15px',
			animation: 'notificationSlideIn 0.3s ease-out',
			maxWidth: '400px',
			width: '100%'
		}}>
			<span>{message}</span>
			<button
				onClick={() => {
					setIsVisible(false);
					setTimeout(onClose, 300);
				}}
				style={{
					background: 'none',
					border: 'none',
					color: 'white',
					cursor: 'pointer',
					fontSize: '18px',
					padding: '0 5px',
					fontWeight: 'bold'
				}}
			>
				×
			</button>
		</div>
	);
};

export default function Profile() {
	const { BASE_URL, logout, setUser, user } = useContext(AuthContext);

	const theUser = user.user || {};
	const [newName, setNewName] = useState(theUser?.name || '');
	const [newWeight, setNewWeight] = useState(theUser?.weight?.toString() || '');
	const [isNameEditing, setIsNameEditing] = useState(false);
	const [isWeightEditing, setIsWeightEditing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [scheduleState, setScheduleState] = useState(true);
	const [nutritionState, setNutritionState] = useState(true);
	// Состояния для уведомлений
	const [notification, setNotification] = useState({ message: '', type: '' });
	const { mainColor } = useContext(GlobalContext);
	// Функция для показа уведомления
	const showNotification = (message, type = 'success') => {
		setNotification({ message, type });
	};
	const toggleSchedule = () => {
		setScheduleState(prev => !prev);
		// Здесь можно добавить сохранение состояния на сервере, если нужно
	};
	const toggleNutrition = () => {
		setNutritionState(prev => !prev);
		// Здесь можно добавить сохранение состояния на сервере, если нужно
	};
	const commonStyle = createCommonStyle(mainColor);
	const profileStyles = createProfileStyles(mainColor);


	const updateName = async () => {
		if (!newName.trim()) {
			showNotification('Введите имя', 'error');
			return;
		}

		setIsSubmitting(true);

		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`${BASE_URL}/api/auth/profile`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name: newName.trim() }),
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Ошибка ${res.status}: ${text}`);
			}

			const updated = await res.json();

			// Обновляем пользователя в контексте
			setUser({
				...user,
				user: {
					...theUser,
					name: newName.trim()
				}
			});

			setIsNameEditing(false);
			showNotification('Имя успешно обновлено!', 'success');
		} catch (err) {
			console.error('Ошибка обновления имени:', err);
			showNotification(`Ошибка: ${err.message}`, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Функция для обновления веса
	const updateWeight = async () => {
		const weightValue = parseFloat(newWeight);
		if (isNaN(weightValue) || weightValue <= 0) {
			showNotification('Введите корректный вес', 'error');
			return;
		}

		setIsSubmitting(true);

		try {
			const token = localStorage.getItem('token');
			const res = await fetch(`${BASE_URL}/api/auth/profile`, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ weight: weightValue }),
			});

			if (!res.ok) {
				const text = await res.text();
				throw new Error(`Ошибка ${res.status}: ${text}`);
			}

			const updated = await res.json();

			// Обновляем пользователя в контексте
			setUser({
				...user,
				user: {
					...theUser,
					weight: weightValue
				}
			});

			setIsWeightEditing(false);
			showNotification('Вес успешно обновлен!', 'success');
		} catch (err) {
			console.error('Ошибка обновления веса:', err);
			showNotification(`Ошибка: ${err.message}`, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	// Отмена редактирования имени
	const cancelNameEdit = () => {
		setNewName(theUser?.name || '');
		setIsNameEditing(false);
	};

	// Отмена редактирования веса
	const cancelWeightEdit = () => {
		setNewWeight(theUser?.weight?.toString() || '');
		setIsWeightEditing(false);
	};

	return (
		<>
			{/* Компонент уведомления */}
			<Notification
				message={notification.message}
				type={notification.type}
				onClose={() => setNotification({ message: '', type: '' })}
			/>

			<Header />
			<main style={profileStyles.profileSection}>
				<div style={commonStyle.titleHeader}>
					<h2 style={commonStyle.title}>My details</h2>
				</div>

				<div style={profileStyles.infoSection}>
					<div style={profileStyles.infoList}>
						{/* Строка редактирования имени */}
						<div style={profileStyles.infoRow}>
							<span style={profileStyles.infoLabel}>Name:</span>
							-
							{isNameEditing ? (
								<div style={profileStyles.infoEditRow}>
									<input
										type="text"
										value={newName}
										onChange={(e) => setNewName(e.target.value)}
										placeholder="Введите новое имя"
										style={profileStyles.input}
										className='profile-input'
										disabled={isSubmitting}
										autoFocus
									/>
									<button
										style={profileStyles.submitButton}
										onClick={updateName}
										disabled={isSubmitting}
									>
										<FaCheck />
									</button>
									<button
										style={profileStyles.cancelButton}
										onClick={cancelNameEdit}
										disabled={isSubmitting}
									>
										<FaTimes />
									</button>
								</div>
							) : (
								<div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'space-between' }}>
									<span style={profileStyles.infoValue}>{theUser?.name || 'Not specified'}</span>
									<button
										style={profileStyles.editButton}
										onClick={() => setIsNameEditing(true)}
										disabled={isSubmitting}
									>
										<img src="/img/icons/editorange.png" alt="edit icon" />
									</button>
								</div>
							)}
						</div>
						{/* Строка редактирования веса */}
						<div style={profileStyles.infoRow}>
							<span style={profileStyles.infoLabel}>Weight:</span>
							-
							{isWeightEditing ? (
								<div style={profileStyles.infoEditRow}>
									<input
										type="number"
										step="0.1"
										min="1"
										value={newWeight}
										onChange={(e) => setNewWeight(e.target.value)}
										placeholder="Введите новый вес"
										style={profileStyles.input}
										className='profile-input'
										disabled={isSubmitting}
										autoFocus
									/>
									<button
										style={profileStyles.submitButton}
										onClick={updateWeight}
										disabled={isSubmitting}
									>
										<FaCheck />
									</button>
									<button
										style={profileStyles.cancelButton}
										onClick={cancelWeightEdit}
										disabled={isSubmitting}
									>
										<FaTimes />
									</button>
								</div>
							) : (
								<div style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', justifyContent: 'space-between' }}>
									<span style={profileStyles.infoValue}>
										{theUser?.weight ? `${theUser.weight} kg` : 'Not specified'}
									</span>
									<button
										style={profileStyles.editButton}
										onClick={() => setIsWeightEditing(true)}
										disabled={isSubmitting}
									>
										<img src="/img/icons/editorange.png" alt="edit icon" />
									</button>
								</div>
							)}
						</div>
					</div>
				</div>
				<div style={{ ...commonStyle.titleHeader, ...{ justifyContent: 'center' } }}>
					<h2 style={commonStyle.title}>Home page settings</h2>
				</div>
				<div style={profileStyles.infoSection}>
					<div style={profileStyles.infoList}>
						<div style={{ ...profileStyles.infoRow, ...{ justifyContent: 'space-between' } }}>
							<span style={profileStyles.infoLabel}>Schedule</span>
							<button
								onClick={toggleSchedule}
								style={{
									...profileStyles.checkBox,
									...(scheduleState ? profileStyles.checkBoxChecked : {})
								}}
							>
								<span style={{
									...profileStyles.checkBoxDott,
									...(scheduleState ? profileStyles.checkBoxDottChecked : {})
								}}></span>
							</button>
						</div>
						<div style={{ ...profileStyles.infoRow, ...{ justifyContent: 'space-between' } }}>
							<span style={profileStyles.infoLabel}>Nutrition</span>
							<button
								onClick={toggleNutrition}
								style={{
									...profileStyles.checkBox,
									...(nutritionState ? profileStyles.checkBoxChecked : {})
								}}
							>
								<span style={{
									...profileStyles.checkBoxDott,
									...(nutritionState ? profileStyles.checkBoxDottChecked : {})
								}}></span>
							</button>
						</div>
						<ProfileMainColorSelector />
					</div>
				</div>
				<button
					onClick={logout}
					style={profileStyles.logoutButton}
					disabled={isSubmitting}
				>
					Log out
				</button>
			</main >
			<Footer />

			{/* Добавляем стили через style тег без jsx атрибута */}
			<style>{`
				@keyframes notificationSlideIn {
					from {
						transform: translateX(100%);
						opacity: 0;
					}
					to {
						transform: translateX(0);
						opacity: 1;
					}
				}
				
				@keyframes notificationSlideOut {
					from {
						transform: translateX(0);
						opacity: 1;
					}
					to {
						transform: translateX(100%);
						opacity: 0;
					}
				}
			`}</style>
		</>
	);
}