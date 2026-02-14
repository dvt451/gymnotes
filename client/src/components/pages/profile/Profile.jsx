import React, { useContext, useState } from 'react';
import { AuthContext } from '../../../context/AuthContext';
import Header from '../../widgets/Header';
import Footer from '../../widgets/Footer';
import { commonStyle } from '../../../styles/commonStyle';

export default function Profile() {
	const { BASE_URL, logout, setUser, user } = useContext(AuthContext);

	const theUser = user.user || {};
	const [newName, setNewName] = useState(theUser?.name || '');
	const [newWeight, setNewWeight] = useState(theUser?.weight?.toString() || '');
	const [isEditing, setIsEditing] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);

	const toggleEdit = () => {
		setIsEditing(!isEditing);
		if (!isEditing) {
			setNewName(theUser?.name || '');
			setNewWeight(theUser?.weight?.toString() || '');
		}
	};

	const editProfile = async () => {
		if (!newName.trim()) {
			alert('Введите имя');
			return;
		}

		const weightValue = parseFloat(newWeight);
		if (isNaN(weightValue) || weightValue <= 0) {
			alert('Введите корректный вес');
			return;
		}

		setIsSubmitting(true);

		const updatedProfile = {
			name: newName.trim(),
			weight: weightValue,
		};

		try {
			const token = localStorage.getItem('token');
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
				throw new Error(`Ошибка ${res.status}: ${text}`);
			}

			const updated = await res.json();
			setUser(updated);
			setIsEditing(false);
			alert('Профиль успешно обновлен!');
		} catch (err) {
			console.error('Ошибка обновления профиля:', err);
			alert(`Ошибка: ${err.message}`);
		} finally {
			setIsSubmitting(false);
		}
	};

	const handleCancel = () => {
		setNewName(theUser?.name || '');
		setNewWeight(theUser?.weight?.toString() || '');
		setIsEditing(false);
	};

	return (
		<>
			<Header />
			<main style={styles.profileSection}>
				<div style={commonStyle.titleHeader}>
					<h2 style={commonStyle.title}>My details</h2>
				</div>
				{isEditing ? (
					<div style={styles.editSection}>
						<div style={styles.inputGroup}>
							<label style={styles.label}>Name</label>
							<input
								type="text"
								value={newName}
								onChange={(e) => setNewName(e.target.value)}
								placeholder="Введите новое имя"
								style={styles.input}
								disabled={isSubmitting}
							/>
						</div>

						<div style={styles.inputGroup}>
							<label style={styles.label}>Вес (кг)</label>
							<input
								type="number"
								step="0.1"
								min="1"
								value={newWeight}
								onChange={(e) => setNewWeight(e.target.value)}
								placeholder="Введите вес"
								style={styles.input}
								disabled={isSubmitting}
							/>
						</div>

						<div style={styles.buttonGroup}>
							<button
								onClick={editProfile}
								style={styles.saveButton}
								disabled={isSubmitting}
							>
								{isSubmitting ? 'Сохранение...' : '💾 Сохранить'}
							</button>
							<button
								onClick={handleCancel}
								style={styles.cancelButton}
								disabled={isSubmitting}
							>
								Отмена
							</button>
						</div>
					</div>
				) : (
					<div style={styles.infoSection}>
						<div style={styles.infoList}>
							<div style={styles.infoRow}>
								<span style={styles.infoLabel}>Name:</span>
								-
								<span style={styles.infoValue}>{theUser?.name || 'Not specified'}</span>
							</div>
							<div style={styles.infoRow}>
								<span style={styles.infoLabel}>Weight:</span>
								-
								<span style={styles.infoValue}>{theUser?.weight ? `${theUser.weight}kg` : 'Not specified'}</span>
							</div>
						</div>
						<button
							onClick={toggleEdit}
							style={styles.editButton}
						>
							✏️ Редактировать профиль
						</button>
					</div>
				)}

				<button
					onClick={logout}
					style={styles.logoutButton}
					disabled={isSubmitting}
				>
					🚪 Выйти из аккаунта
				</button>
			</main>
			<Footer />
		</>
	);
}

const styles = {
	profileSection: {
		textAlign: 'center',
		marginBottom: '30px',
		paddingBottom: '20px',
		padding: '18px',
	},
	editSection: {
		marginBottom: '25px',
	},
	inputGroup: {
		marginBottom: '20px',
	},
	label: {
		display: 'block',
		marginBottom: '8px',
		fontSize: '14px',
		color: '#555',
		fontWeight: '500',
	},
	input: {
		width: '100%',
		padding: '12px 15px',
		border: '1px solid #ddd',
		borderRadius: '8px',
		fontSize: '15px',
		boxSizing: 'border-box',
		transition: 'border-color 0.2s',
		color: '#000',
	},
	inputFocus: {
		borderColor: '#4a90e2',
		outline: 'none',
	},
	buttonGroup: {
		display: 'flex',
		gap: '10px',
		marginTop: '20px',
	},
	saveButton: {
		flex: 1,
		padding: '12px',
		backgroundColor: '#4a90e2',
		color: 'white',
		border: 'none',
		borderRadius: '8px',
		fontSize: '15px',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'background-color 0.2s',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '8px',
	},
	saveButtonDisabled: {
		backgroundColor: '#ccc',
		cursor: 'not-allowed',
	},
	cancelButton: {
		flex: 1,
		padding: '12px',
		backgroundColor: '#f0f0f0',
		color: '#666',
		border: 'none',
		borderRadius: '8px',
		fontSize: '15px',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'background-color 0.2s',
	},
	infoSection: {
		marginBottom: '25px',
	},
	infoList: {
		display: 'flex',
		flexDirection: 'column',
		gap: '15px',
	},
	infoRow: {
		display: 'flex',
		alignItems: 'center',
		gap: '10px',
	},
	infoLabel: {
		fontSize: '15px',
		color: '#fff',
		fontWeight: 'bold',
	},
	infoValue: {
		fontSize: '16px',
		color: '#fff',
		fontWeight: '600',
	},
	editButton: {
		width: '100%',
		padding: '12px',
		backgroundColor: 'transparent',
		color: '#4a90e2',
		border: '2px solid #4a90e2',
		borderRadius: '8px',
		fontSize: '15px',
		fontWeight: '600',
		cursor: 'pointer',
		marginTop: '20px',
		transition: 'all 0.2s',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '8px',
	},
	editButtonHover: {
		backgroundColor: '#4a90e2',
		color: 'white',
	},
	logoutButton: {
		width: '100%',
		padding: '12px',
		backgroundColor: '#ff6b6b',
		color: 'white',
		border: 'none',
		borderRadius: '8px',
		fontSize: '15px',
		fontWeight: '600',
		cursor: 'pointer',
		transition: 'background-color 0.2s',
		display: 'flex',
		alignItems: 'center',
		justifyContent: 'center',
		gap: '8px',
	},
	logoutButtonHover: {
		backgroundColor: '#ff5252',
	},
};