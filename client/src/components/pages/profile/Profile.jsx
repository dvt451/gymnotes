import React, { useContext, useEffect, useState } from 'react';
import { FaCheck, FaTimes } from 'react-icons/fa';
import { AuthContext } from '../../../context/AuthContext';
import { GlobalContext } from '../../../context/GlobalContext';
import { createCommonStyle } from '../../../styles/commonStyle';
import Footer from '../../widgets/Footer';
import Header from '../../widgets/Header';
import SectionSkeleton from '../../widgets/Loading/SectionSkeleton';
import Gradient from '../../widgets/Gradient';
import ProfileMainColorSelector from './ProfileMainColorSelector';
import { createProfileStyles } from './profileStyles';

const Notification = ({ message, type, onClose }) => {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		if (message) {
			const timer = setTimeout(() => {
				setIsVisible(false);
				setTimeout(onClose, 300);
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
			width: '100%',
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
					fontWeight: 'bold',
				}}
			>
				x
			</button>
		</div>
	);
};

export default function Profile() {
	const { BASE_URL, logout, setUser, user } = useContext(AuthContext);
	const { mainColor } = useContext(GlobalContext);
	const theUser = user?.user || {};
	const isProfileLoading = !user?.user;
	const [newName, setNewName] = useState(theUser?.name || '');
	const [newWeight, setNewWeight] = useState(theUser?.weight?.toString() || '');
	const [isNameEditing, setIsNameEditing] = useState(false);
	const [isWeightEditing, setIsWeightEditing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [scheduleState, setScheduleState] = useState(true);
	const [nutritionState, setNutritionState] = useState(true);
	const [notification, setNotification] = useState({ message: '', type: '' });
	const commonStyle = createCommonStyle(mainColor);
	const profileStyles = createProfileStyles(mainColor);

	useEffect(() => {
		if (!isNameEditing) {
			setNewName(theUser?.name || '');
		}
		if (!isWeightEditing) {
			setNewWeight(theUser?.weight?.toString() || '');
		}
	}, [isNameEditing, isWeightEditing, theUser?.name, theUser?.weight]);

	const showNotification = (message, type = 'success') => {
		setNotification({ message, type });
	};

	const toggleSchedule = () => {
		setScheduleState((prev) => !prev);
	};

	const toggleNutrition = () => {
		setNutritionState((prev) => !prev);
	};

	const updateName = async () => {
		if (!newName.trim()) {
			showNotification('Enter a name', 'error');
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
				throw new Error(`Error ${res.status}: ${text}`);
			}

			setUser({
				...user,
				user: {
					...theUser,
					name: newName.trim(),
				},
			});

			setIsNameEditing(false);
			showNotification('Name updated successfully!', 'success');
		} catch (err) {
			console.error('Error updating name:', err);
			showNotification(`Error: ${err.message}`, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	const updateWeight = async () => {
		const weightValue = parseFloat(newWeight);
		if (Number.isNaN(weightValue) || weightValue <= 0) {
			showNotification('Enter a valid weight', 'error');
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
				throw new Error(`Error ${res.status}: ${text}`);
			}

			setUser({
				...user,
				user: {
					...theUser,
					weight: weightValue,
				},
			});

			setIsWeightEditing(false);
			showNotification('Weight updated successfully!', 'success');
		} catch (err) {
			console.error('Error updating weight:', err);
			showNotification(`Error: ${err.message}`, 'error');
		} finally {
			setIsSubmitting(false);
		}
	};

	const cancelNameEdit = () => {
		setNewName(theUser?.name || '');
		setIsNameEditing(false);
	};

	const cancelWeightEdit = () => {
		setNewWeight(theUser?.weight?.toString() || '');
		setIsWeightEditing(false);
	};

	return (
		<>
			<Notification
				key={notification.message || 'empty-notification'}
				message={notification.message}
				type={notification.type}
				onClose={() => setNotification({ message: '', type: '' })}
			/>
			<Gradient />
			<div style={{ position: 'relative', zIndex: 1 }}>
				<Header />
				<main style={profileStyles.profileSection}>
					{isProfileLoading ? (
						<>
							<div style={commonStyle.commonSection}>
								<SectionSkeleton
									headerWidth="30%"
									headerAsideWidth="18%"
									cards={2}
									cardHeight={56}
									cardGap={12}
								/>
							</div>
							<div style={commonStyle.commonSection}>
								<SectionSkeleton
									headerWidth="42%"
									headerAsideWidth="20%"
									cards={3}
									cardHeight={48}
									cardGap={12}
								/>
								<div className="ui-skeleton" style={{ height: '48px', borderRadius: '12px', marginTop: '20px' }}></div>
							</div>
						</>
					) : (
						<>
							<div style={commonStyle.commonSection}>
								<div style={commonStyle.titleHeader}>
									<h2 style={commonStyle.title}>My details</h2>
								</div>

								<div style={profileStyles.infoSection}>
									<div style={profileStyles.infoList}>
										<div style={profileStyles.infoRow}>
											<span style={profileStyles.infoLabel}>Name:</span>
											-
											{isNameEditing ? (
												<div style={profileStyles.infoEditRow}>
													<input
														type="text"
														value={newName}
														onChange={(e) => setNewName(e.target.value)}
														placeholder="Enter a new name"
														style={profileStyles.input}
														className="profile-input"
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
														placeholder="Enter a new weight"
														style={profileStyles.input}
														className="profile-input"
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
							</div>

							<div style={commonStyle.commonSection}>
								<div style={commonStyle.titleHeader}>
									<h2 style={commonStyle.title}>Home page settings</h2>
								</div>
								<div style={profileStyles.infoSection}>
									<div style={profileStyles.infoList}>
										<div style={{ ...profileStyles.infoRow, justifyContent: 'space-between' }}>
											<span style={profileStyles.infoLabel}>Schedule</span>
											<button
												onClick={toggleSchedule}
												style={{
													...profileStyles.checkBox,
													...(scheduleState ? profileStyles.checkBoxChecked : {}),
												}}
											>
												<span
													style={{
														...profileStyles.checkBoxDott,
														...(scheduleState ? profileStyles.checkBoxDottChecked : {}),
													}}
												></span>
											</button>
										</div>
										<div style={{ ...profileStyles.infoRow, justifyContent: 'space-between' }}>
											<span style={profileStyles.infoLabel}>Nutrition</span>
											<button
												onClick={toggleNutrition}
												style={{
													...profileStyles.checkBox,
													...(nutritionState ? profileStyles.checkBoxChecked : {}),
												}}
											>
												<span
													style={{
														...profileStyles.checkBoxDott,
														...(nutritionState ? profileStyles.checkBoxDottChecked : {}),
													}}
												></span>
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
							</div>
						</>
					)}
				</main>
				<Footer />
			</div>
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
