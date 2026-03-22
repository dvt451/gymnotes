import React, { useContext, useEffect, useState } from 'react';
import { FaPen } from 'react-icons/fa';
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
import { createPopupStyle } from '../../widgets/popupStyle';
import MuscleGroupSelect from '../../widgets/MuscleGroupSelect';
import { handleCreateExercise as createExerciseInLibrary } from './handleCreateExercise';
import {
	buildMuscleGroupList,
	groupExercisesByMuscleGroup,
	isDefaultMuscleGroup,
	normalizeExerciseMuscleGroup,
	sortExercisesByMuscleGroup,
} from './muscleGroups';

const normalizeLibraryExercise = (exercise) => ({
	...exercise,
	muscleGroup: normalizeExerciseMuscleGroup(exercise?.muscleGroup),
});

const sortUserExercises = (exercises = [], muscleGroups = []) =>
	[...exercises]
		.map((exercise) => ({
			...normalizeLibraryExercise(exercise),
			muscleGroup: normalizeExerciseMuscleGroup(exercise?.muscleGroup, muscleGroups),
		}))
		.sort((a, b) => sortExercisesByMuscleGroup(a, b, muscleGroups));

export default function ExerciseLibrary() {
	const { mainColor } = useContext(GlobalContext);
	const { BASE_URL } = useContext(AuthContext);
	const styles = createExercisesStyles(mainColor);
	const commonStyle = createCommonStyle(mainColor);
	const popupStyle = createPopupStyle(mainColor);
	const [userExercises, setUserExercises] = useState([]);
	const [muscleGroups, setMuscleGroups] = useState(buildMuscleGroupList([]));
	const [customMuscleGroups, setCustomMuscleGroups] = useState([]);
	const [isLoading, setIsLoading] = useState(true);
	const [error, setError] = useState('');
	const [newMuscleGroupName, setNewMuscleGroupName] = useState('');
	const [muscleGroupError, setMuscleGroupError] = useState('');
	const [isCreatingMuscleGroup, setIsCreatingMuscleGroup] = useState(false);
	const [renameMuscleGroupModalVisible, setRenameMuscleGroupModalVisible] = useState(false);
	const [muscleGroupToRename, setMuscleGroupToRename] = useState('');
	const [renameMuscleGroupValue, setRenameMuscleGroupValue] = useState('');
	const [renameMuscleGroupError, setRenameMuscleGroupError] = useState('');
	const [isRenamingMuscleGroup, setIsRenamingMuscleGroup] = useState(false);
	const [deletingExerciseId, setDeletingExerciseId] = useState('');
	const [renamingExerciseId, setRenamingExerciseId] = useState('');
	const [renameModalVisible, setRenameModalVisible] = useState(false);
	const [renameExercise, setRenameExercise] = useState(null);
	const [renameValue, setRenameValue] = useState('');
	const [renameMuscleGroup, setRenameMuscleGroup] = useState('Others');
	const [renameError, setRenameError] = useState('');

	useEffect(() => {
		const loadLibrary = async () => {
			try {
				setIsLoading(true);
				setError('');
				const token = getToken();

				if (!token) {
					setError('Authorization required');
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
					throw new Error(data.message || 'Failed to load exercise library');
				}

				setUserExercises(
					sortUserExercises(
						Array.isArray(data.userExercises) ? data.userExercises : [],
						Array.isArray(data.muscleGroups) ? data.muscleGroups : []
					)
				);
				setMuscleGroups(buildMuscleGroupList(data?.muscleGroups || []));
				setCustomMuscleGroups(Array.isArray(data.customMuscleGroups) ? data.customMuscleGroups : []);
			} catch (err) {
				setError(err.message || 'Failed to load exercise library');
			} finally {
				setIsLoading(false);
			}
		};

		loadLibrary();
	}, [BASE_URL]);

	const handleCreateExercise = async (exerciseName, muscleGroup) => {
		const result = await createExerciseInLibrary({
			BASE_URL,
			exerciseName,
			existingExercises: userExercises,
			muscleGroup,
		});

		if (!result.success) {
			return result;
		}

		if (result.exercise) {
			const normalizedExercise = normalizeLibraryExercise(result.exercise);
			const nextMuscleGroups = buildMuscleGroupList([
				...muscleGroups,
				normalizedExercise.muscleGroup,
			]);
			setMuscleGroups(nextMuscleGroups);

			setUserExercises((prev) => {
				const existsById = prev.some(
					(item) =>
						String(item._id || item.id) ===
						String(normalizedExercise._id || normalizedExercise.id)
				);
				if (existsById) return prev;

				return sortUserExercises([...prev, normalizedExercise], nextMuscleGroups);
			});
		}

		if (result.alreadyExists) {
			return { success: false, message: result.message || 'Exercise already exists' };
		}

		return { success: true };
	};

	const handleCreateMuscleGroup = async () => {
		const nextName = newMuscleGroupName.trim();
		if (!nextName) {
			setMuscleGroupError('Enter muscle group name');
			return;
		}

		setIsCreatingMuscleGroup(true);
		setMuscleGroupError('');

		try {
			const token = getToken();
			if (!token) {
				setMuscleGroupError('Authorization required');
				return;
			}

			const response = await fetch(`${BASE_URL}/api/exercise-library/muscle-groups`, {
				method: 'POST',
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
				setMuscleGroupError(data?.message || 'Failed to create muscle group');
				return;
			}

			setMuscleGroups(buildMuscleGroupList(data?.muscleGroups || [data?.muscleGroup]));
			setCustomMuscleGroups(
				Array.isArray(data?.customMuscleGroups) ? data.customMuscleGroups : customMuscleGroups
			);
			setNewMuscleGroupName('');
		} catch (err) {
			setMuscleGroupError(err.message || 'Failed to create muscle group');
		} finally {
			setIsCreatingMuscleGroup(false);
		}
	};

	const openRenameMuscleGroupModal = (groupName) => {
		setMuscleGroupToRename(groupName);
		setRenameMuscleGroupValue(groupName);
		setRenameMuscleGroupError('');
		setRenameMuscleGroupModalVisible(true);
	};

	const closeRenameMuscleGroupModal = () => {
		setRenameMuscleGroupModalVisible(false);
		setMuscleGroupToRename('');
		setRenameMuscleGroupValue('');
		setRenameMuscleGroupError('');
	};

	const handleRenameMuscleGroup = async () => {
		const currentName = muscleGroupToRename.trim();
		const nextName = renameMuscleGroupValue.trim();
		if (!currentName || !nextName) return;

		setIsRenamingMuscleGroup(true);
		setRenameMuscleGroupError('');

		try {
			const token = getToken();
			if (!token) {
				setRenameMuscleGroupError('Authorization required');
				return;
			}

			const response = await fetch(
				`${BASE_URL}/api/exercise-library/muscle-groups/${encodeURIComponent(currentName)}`,
				{
					method: 'PUT',
					headers: {
						'Content-Type': 'application/json',
						Authorization: `Bearer ${token}`,
					},
					body: JSON.stringify({ name: nextName }),
				}
			);

			const data = (response.headers.get('content-type') || '').includes('application/json')
				? await response.json()
				: {};

			if (!response.ok) {
				setRenameMuscleGroupError(data?.message || 'Failed to rename muscle group');
				return;
			}

			const nextGroupName = data?.muscleGroup || nextName;
			const nextMuscleGroups = buildMuscleGroupList(data?.muscleGroups || [nextGroupName]);
			setMuscleGroups(nextMuscleGroups);
			setCustomMuscleGroups(
				Array.isArray(data?.customMuscleGroups) ? data.customMuscleGroups : customMuscleGroups
			);
			setUserExercises((prev) =>
				sortUserExercises(
					prev.map((item) =>
						normalizeExerciseMuscleGroup(item.muscleGroup, nextMuscleGroups).toLowerCase() ===
							currentName.toLowerCase()
							? { ...item, muscleGroup: nextGroupName }
							: item
					),
					nextMuscleGroups
				)
			);

			closeRenameMuscleGroupModal();
		} catch (err) {
			setRenameMuscleGroupError(err.message || 'Failed to rename muscle group');
		} finally {
			setIsRenamingMuscleGroup(false);
		}
	};

	const handleDeleteExercise = async (exercise) => {
		const exerciseId = exercise?._id || exercise?.id;
		if (!exerciseId) return;

		const shouldDelete = window.confirm(
			`Delete "${exercise.name}" from the global library?`
		);
		if (!shouldDelete) return;

		setDeletingExerciseId(String(exerciseId));
		setError('');

		try {
			const token = getToken();
			if (!token) {
				setError('Authorization required');
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
					`This exercise is used in dates (${usage.entries || 0}) and templates (${usage.templates || 0}). Delete it everywhere?`
				);
				if (!shouldCascade) return;

				response = await sendDelete(true);
				data = {};
				if ((response.headers.get('content-type') || '').includes('application/json')) {
					data = await response.json();
				}
			}

			if (!response.ok) {
				throw new Error(data?.message || 'Failed to delete exercise');
			}

			setUserExercises((prev) =>
				prev.filter((item) => String(item._id || item.id) !== String(exerciseId))
			);
		} catch (err) {
			setError(err.message || 'Failed to delete exercise');
		} finally {
			setDeletingExerciseId('');
		}
	};

	const openRenameModal = (exercise) => {
		setRenameExercise(exercise);
		setRenameValue(exercise?.name || '');
		setRenameMuscleGroup(normalizeExerciseMuscleGroup(exercise?.muscleGroup));
		setRenameError('');
		setRenameModalVisible(true);
	};

	const closeRenameModal = () => {
		setRenameModalVisible(false);
		setRenameExercise(null);
		setRenameValue('');
		setRenameMuscleGroup('Others');
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
				setRenameError('Authorization required');
				return;
			}

			const response = await fetch(`${BASE_URL}/api/exercise-library/${exerciseId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					Authorization: `Bearer ${token}`,
				},
				body: JSON.stringify({
					name: nextName,
					muscleGroup: renameMuscleGroup,
				}),
			});

			const data = (response.headers.get('content-type') || '').includes('application/json')
				? await response.json()
				: {};

			if (!response.ok) {
				setRenameError(data?.message || 'Failed to rename exercise');
				return;
			}

			const updated = normalizeLibraryExercise(data?.exercise || {});
			const nextMuscleGroups = buildMuscleGroupList([
				...muscleGroups,
				updated?.muscleGroup,
			]);
			setMuscleGroups(nextMuscleGroups);
			setUserExercises((prev) =>
				sortUserExercises(
					prev.map((item) =>
						String(item._id || item.id) === String(exerciseId)
							? {
								...item,
								name: updated?.name || nextName,
								muscleGroup: updated?.muscleGroup || item.muscleGroup,
							}
							: item
					),
					nextMuscleGroups
				)
			);

			closeRenameModal();
		} catch (err) {
			setRenameError(err.message || 'Failed to rename exercise');
		} finally {
			setRenamingExerciseId('');
		}
	};

	const allMuscleGroupSections = groupExercisesByMuscleGroup(userExercises, muscleGroups, {
		includeEmpty: true,
	});
	const groupedUserExercises = groupExercisesByMuscleGroup(userExercises, muscleGroups);

	return (
		<>
			<Header />
			<main style={styles.container}>
				<div style={{ ...commonStyle.titleHeader, ...styles.exercisesHeader }}>
					<h2 style={commonStyle.title}>Exercise Library</h2>
				</div>
				<div style={styles.exerciseListBlock}>
					<div style={styles.muscleGroupsBlock}>
						<div style={styles.muscleGroupsHeader}>
							<h3 style={{ ...commonStyle.title, ...styles.exercisesListTitle, paddingTop: 0, paddingBottom: 0 }}>
								Muscle Groups
							</h3>
							<span style={styles.exerciseGroupCount}>
								{muscleGroups.length} group{muscleGroups.length !== 1 ? 's' : ''}
							</span>
						</div>
						<div style={styles.muscleGroupsList}>
							{allMuscleGroupSections.map(({ group, exercises }) => (
								<div key={group} style={styles.muscleGroupCard}>
									<div style={styles.muscleGroupCardHeader}>
										<strong style={styles.muscleGroupCardTitle}>{group}</strong>
										{customMuscleGroups.some(
											(item) => item.toLowerCase() === group.toLowerCase()
										) && !isDefaultMuscleGroup(group) && (
												<button
													type="button"
													style={styles.muscleGroupEditButton}
													onClick={() => openRenameMuscleGroupModal(group)}
													aria-label={`Rename ${group}`}
												>
													<FaPen />
												</button>
											)}
									</div>
									<span style={styles.muscleGroupCardCount}>
										{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
									</span>
								</div>
							))}
						</div>
						<div style={styles.muscleGroupCreateRow}>
							<input
								type="text"
								style={popupStyle.popupInput}
								value={newMuscleGroupName}
								onChange={(e) => {
									setMuscleGroupError('');
									setNewMuscleGroupName(e.target.value);
								}}
								placeholder="Create muscle group"
							/>
							<button
								type="button"
								style={styles.muscleGroupCreateButton}
								onClick={handleCreateMuscleGroup}
								disabled={!newMuscleGroupName.trim() || isCreatingMuscleGroup}
							>
								{isCreatingMuscleGroup ? 'Saving...' : 'Add Group'}
							</button>
						</div>
						{muscleGroupError && (
							<p style={{ ...styles.error, marginTop: '12px', marginBottom: 0 }}>
								{muscleGroupError}
							</p>
						)}
					</div>
					<h3 style={{ ...commonStyle.title, ...styles.exercisesListTitle }}>User Library</h3>
					{isLoading && <p style={styles.noExercises}>Loading...</p>}
					{error && <p style={styles.error}>{error}</p>}
					<div style={styles.exercisesList}>
						{!isLoading && !error && userExercises.length === 0 && (
							<p style={styles.noExercises}>You have no exercises yet</p>
						)}
						{groupedUserExercises.map(({ group, exercises }) => (
							<section key={group} style={styles.exerciseGroupSection}>
								<div style={styles.exerciseGroupHeader}>
									<h4 style={styles.exerciseGroupTitle}>{group}</h4>
									<span style={styles.exerciseGroupCount}>
										{exercises.length} exercise{exercises.length !== 1 ? 's' : ''}
									</span>
								</div>
								{exercises.map((item) => (
									<ExerciseLibraryItem
										key={item._id || item.id || item.name}
										name={item.name}
										muscleGroup={item.muscleGroup}
										onRename={() => openRenameModal(item)}
										onDelete={() => handleDeleteExercise(item)}
										isRenaming={renamingExerciseId === String(item._id || item.id)}
										isDeleting={deletingExerciseId === String(item._id || item.id)}
									/>
								))}
							</section>
						))}
					</div>
					<CreateExerciseButton
						existingExercises={userExercises}
						onCreateExercise={handleCreateExercise}
						muscleGroups={muscleGroups}
					/>
				</div>
			</main>

			<Popup isOpen={renameModalVisible} onClose={closeRenameModal}>
				<h3 style={{ textAlign: 'center', margin: 0 }}>Rename Exercise</h3>
				<div style={popupStyle.popupContentInputs}>
					<input
						type="text"
						style={popupStyle.popupInput}
						value={renameValue}
						onChange={(e) => setRenameValue(e.target.value)}
						placeholder="New name"
						autoFocus
					/>
					<MuscleGroupSelect
						style={popupStyle.popupInput}
						value={renameMuscleGroup}
						onChange={setRenameMuscleGroup}
						options={muscleGroups}
						disabled={Boolean(renamingExerciseId)}
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
						{renamingExerciseId ? 'Saving...' : 'Save'}
					</button>
					<button
						type="button"
						style={commonStyle.popupCancelButton}
						onClick={closeRenameModal}
						disabled={Boolean(renamingExerciseId)}
					>
						Cancel
					</button>
				</div>
			</Popup>

			<Popup
				isOpen={renameMuscleGroupModalVisible}
				onClose={closeRenameMuscleGroupModal}
			>
				<h3 style={{ textAlign: 'center', margin: 0 }}>Rename Muscle Group</h3>
				<input
					type="text"
					style={popupStyle.popupInput}
					value={renameMuscleGroupValue}
					onChange={(e) => setRenameMuscleGroupValue(e.target.value)}
					placeholder="New muscle group name"
					autoFocus
				/>
				{renameMuscleGroupError && (
					<p style={{ ...styles.error, margin: 0, padding: '8px' }}>
						{renameMuscleGroupError}
					</p>
				)}
				<div style={commonStyle.popupButtons}>
					<button
						type="button"
						style={commonStyle.popupCreateButton}
						onClick={handleRenameMuscleGroup}
						disabled={!renameMuscleGroupValue.trim() || isRenamingMuscleGroup}
					>
						{isRenamingMuscleGroup ? 'Saving...' : 'Save'}
					</button>
					<button
						type="button"
						style={commonStyle.popupCancelButton}
						onClick={closeRenameMuscleGroupModal}
						disabled={isRenamingMuscleGroup}
					>
						Cancel
					</button>
				</div>
			</Popup>

			<Footer />
		</>
	);
}
