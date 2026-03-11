import React, { useContext, useEffect, useState } from 'react';
import Footer from '../../widgets/Footer';
import Header from '../../widgets/Header';
import Popup from '../../widgets/Popup';
import { createExercisesStyles } from './ExersicesStyles';
import { GlobalContext } from '../../../context/GlobalContext';
import { createCommonStyle } from '../../../styles/commonStyle';
import ExerciseLibraryItem from './ExerciseLibraryItem';
import CreateExerciseButton from './CreateExerciseButton';
import { AuthContext } from '../../../context/AuthContext';
import { getToken } from '../../utils/getToken';
import { handleCreateExercise as createExerciseInLibrary } from './handleCreateExercise';

export default function ExerciseLibrary() {
	const { mainColor } = useContext(GlobalContext);
	const { BASE_URL } = useContext(AuthContext);
	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);
	const [appExercises, setAppExercises] = useState([]);
	const [userExercises, setUserExercises] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [deletingExerciseId, setDeletingExerciseId] = useState('');
	const [renamingExerciseId, setRenamingExerciseId] = useState('');
	const [renameModalVisible, setRenameModalVisible] = useState(false);
	const [renameExercise, setRenameExercise] = useState(null);
	const [renameValue, setRenameValue] = useState('');
	const [renameError, setRenameError] = useState('');

	useEffect(() => {
		const loadLibrary = async () => {
			try {
				setIsLoading(true);
				setError('');
				const token = getToken();

				if (!token) {
					setError('Требуется авторизация');
					return;
				}

				const response = await fetch(`${BASE_URL}/api/exercise-library`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				const contentType = response.headers.get('content-type') || '';
				const data = contentType.includes('application/json')
					? await response.json()
					: {};

				if (!response.ok) {
					throw new Error(data.message || 'Не удалось загрузить библиотеку упражнений');
				}

				setAppExercises(Array.isArray(data.appExercises) ? data.appExercises : []);
				setUserExercises(Array.isArray(data.userExercises) ? data.userExercises : []);
			} catch (err) {
				setError(err.message || 'Ошибка загрузки библиотеки упражнений');
			} finally {
				setIsLoading(false);
			}
		};

		loadLibrary();
	}, [BASE_URL]);

	const handleCreateExercise = async (exerciseName) => {
		const result = await createExerciseInLibrary({
			BASE_URL,
			exerciseName,
			existingExercises: userExercises,
		});

		if (!result.success) {
			return result;
		}

		if (result.exercise) {
			setUserExercises((prev) => {
				const existsById = prev.some(
					(item) => String(item._id || item.id) === String(result.exercise._id || result.exercise.id)
				);
				if (existsById) return prev;

				return [...prev, result.exercise].sort((a, b) =>
					(a.name || '').localeCompare(b.name || '')
				);
			});
		}

		if (result.alreadyExists) {
			return { success: false, message: result.message || 'Упражнение уже существует' };
		}

		return { success: true };
	};

	const handleDeleteExercise = async (exercise) => {
		const exerciseId = exercise?._id || exercise?.id;
		if (!exerciseId) return;

		const shouldDelete = window.confirm(`Удалить "${exercise.name}" из глобальной библиотеки?`);
		if (!shouldDelete) return;

		setDeletingExerciseId(String(exerciseId));
		setError('');

		try {
			const token = getToken();
			if (!token) {
				setError('Требуется авторизация');
				return;
			}

			const sendDelete = async (cascade = false) => {
				const query = cascade ? '?cascade=true' : '';
				return fetch(`${BASE_URL}/api/exercise-library/${exerciseId}${query}`, {
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
			};

			let response = await sendDelete(false);
			let data = {};
			if ((response.headers.get('content-type') || '').includes('application/json')) {
				data = await response.json();
			}

			if (response.status === 409) {
				const usage = data?.usage || {};
				const shouldCascade = window.confirm(
					`Упражнение используется в датах (${usage.entries || 0}) и шаблонах (${usage.templates || 0}). Удалить везде?`
				);
				if (!shouldCascade) return;

				response = await sendDelete(true);
				data = {};
				if ((response.headers.get('content-type') || '').includes('application/json')) {
					data = await response.json();
				}
			}

			if (!response.ok) {
				throw new Error(data?.message || 'Не удалось удалить упражнение');
			}

			setUserExercises((prev) =>
				prev.filter((item) => String(item._id || item.id) !== String(exerciseId))
			);
		} catch (err) {
			setError(err.message || 'Не удалось удалить упражнение');
		} finally {
			setDeletingExerciseId('');
		}
	};

	const openRenameModal = (exercise) => {
		setRenameExercise(exercise);
		setRenameValue(exercise?.name || '');
		setRenameError('');
		setRenameModalVisible(true);
	};

	const closeRenameModal = () => {
		setRenameModalVisible(false);
		setRenameExercise(null);
		setRenameValue('');
		setRenameError('');
	};

	const handleRenameExercise = async () => {
		const exerciseId = renameExercise?._id || renameExercise?.id;
		const nextName = renameValue.trim();
		if (!exerciseId || !nextName) return;

		setRenamingExerciseId(String(exerciseId));
		setRenameError('');

		try {
			const token = getToken();
			if (!token) {
				setRenameError('Требуется авторизация');
				return;
			}

			const response = await fetch(`${BASE_URL}/api/exercise-library/${exerciseId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({ name: nextName }),
			});

			const data = (response.headers.get('content-type') || '').includes('application/json')
				? await response.json()
				: {};

			if (!response.ok) {
				setRenameError(data?.message || 'Не удалось переименовать упражнение');
				return;
			}

			const updated = data?.exercise;
			setUserExercises((prev) =>
				prev
					.map((item) =>
						String(item._id || item.id) === String(exerciseId)
							? { ...item, name: updated?.name || nextName }
							: item
					)
					.sort((a, b) => (a.name || '').localeCompare(b.name || ''))
			);

			closeRenameModal();
		} catch (err) {
			setRenameError(err.message || 'Не удалось переименовать упражнение');
		} finally {
			setRenamingExerciseId('');
		}
	};

	return (
		<>
			<Header />
			<main style={styles.container}>
				<div style={{ ...commonStyle.titleHeader, ...styles.exercisesHeader }}>
					<h2 style={commonStyle.title}>Exercise Library</h2>
				</div>
				<div style={styles.exerciseListBlock}>
					<h3 style={{ ...commonStyle.title, ...styles.exercisesListTitle }}>App Library</h3>
					<div style={styles.exercisesList}>
						{appExercises.map((item) => (
							<ExerciseLibraryItem key={item.id || item._id || item.name} name={item.name} />
						))}
					</div>
				</div>
				<div style={styles.exerciseListBlock}>
					<h3 style={{ ...commonStyle.title, ...styles.exercisesListTitle }}>User Library</h3>
					{isLoading && <p style={styles.noExercises}>Загрузка...</p>}
					{error && <p style={styles.error}>{error}</p>}
					<div style={styles.exercisesList}>
						{!isLoading && !error && userExercises.length === 0 && (
							<p style={styles.noExercises}>У вас пока нет упражнений</p>
						)}
						{userExercises.map((item) => (
							<ExerciseLibraryItem
								key={item._id || item.id || item.name}
								name={item.name}
								onRename={() => openRenameModal(item)}
								onDelete={() => handleDeleteExercise(item)}
								isRenaming={renamingExerciseId === String(item._id || item.id)}
								isDeleting={deletingExerciseId === String(item._id || item.id)}
							/>
						))}
					</div>
					<CreateExerciseButton
						existingExercises={userExercises}
						onCreateExercise={handleCreateExercise}
					/>
				</div>
			</main>

			<Popup isOpen={renameModalVisible} onClose={closeRenameModal}>
							<h3 style={{ textAlign: 'center', margin: 0 }}>Переименовать упражнение</h3>
							<div style={commonStyle.popupContentInputs}>
								<input
									type="text"
									style={commonStyle.popupInput}
									value={renameValue}
									onChange={(e) => setRenameValue(e.target.value)}
									placeholder="Новое название"
									autoFocus
								/>
							</div>
							{renameError && (
								<p style={{ ...styles.error, margin: 0, padding: '8px' }}>{renameError}</p>
							)}
							<div style={commonStyle.popupButtons}>
								<button
									type="button"
									style={commonStyle.popupCreateButton}
									onClick={handleRenameExercise}
									disabled={!renameValue.trim() || Boolean(renamingExerciseId)}
								>
									{renamingExerciseId ? 'Сохранение...' : 'Сохранить'}
								</button>
								<button
									type="button"
									style={commonStyle.popupCancelButton}
									onClick={closeRenameModal}
									disabled={Boolean(renamingExerciseId)}
								>
									Отмена
								</button>
							</div>
			</Popup>

			<Footer />
		</>
	);
}
