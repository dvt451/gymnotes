import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../../utils/getToken';
import { useTrainings } from './hooks/useTrainings';
import TrainingControls from './widgets/TrainingControls';
import TrainingPopup from './widgets/TrainingPopup';
import DeleteConfirmationModal from './widgets/DeleteConfirmationModal';
import { createCommonStyle } from '../../../../styles/commonStyle';
import { createHomeStyle } from '../homeStyles';
import { GlobalContext } from '../../../../context/GlobalContext';
import ButtonType from '../../../widgets/ButtonType';
import ReorderButton from './widgets/ReorderButton';
import TrainingList from './widgets/TrainingList';
import SavingOrderButton from './widgets/SavingOrderButton';
import SectionSkeleton from '../../../widgets/Loading/SectionSkeleton';

export default function TrainingsSection() {
	const navigate = useNavigate();
	const { userToken, BASE_URL } = useContext(AuthContext);
	const { mainColor } = useContext(GlobalContext);
	const [editState, setEditState] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const [hasLoadedTrainings, setHasLoadedTrainings] = useState(false);

	const homeStyle = createHomeStyle(mainColor);
	const commonStyle = createCommonStyle(mainColor);

	const {
		state,
		setState,
		fetchTrainings,
		createTraining,
		updateTraining,
		deleteTraining,
		saveOrderToServer
	} = useTrainings(BASE_URL, userToken);

	useEffect(() => {
		if (!userToken) return;

		let isActive = true;

		fetchTrainings()
			.finally(() => {
				if (isActive) {
					setHasLoadedTrainings(true);
				}
			});

		return () => {
			isActive = false;
		};
	}, [userToken, fetchTrainings]);

	const loadScene = (item) => {
		navigate(`/date-list/${item._id}`, {
			state: {
				trainingText: item.text,
				trainingTitle: item.name
			}
		});
	};

	const handleCreateSubmit = async () => {
		try {
			const token = getToken();
			await createTraining(token, state.newName, state.newText);

			setState((prev) => ({
				...prev,
				showCreatePopup: false,
				newName: '',
				newText: ''
			}));

			await fetchTrainings();
		} catch (err) {
			alert(`Error: ${err.message}`);
		}
	};

	const handleEditSubmit = async () => {
		try {
			const token = getToken();
			await updateTraining(token, state.selectedTraining._id, state.editName, state.editText);

			setState((prev) => ({
				...prev,
				showEditPopup: false,
				selectedTraining: null
			}));

			await fetchTrainings();
		} catch (err) {
			alert(`Error: ${err.message}`);
		}
	};

	const handleDeleteConfirm = async () => {
		try {
			setState((prev) => ({
				...prev,
				isLoading: true
			}));

			const token = getToken();
			await deleteTraining(token, state.selectedTraining._id);

			setShowDeleteModal(false);
			setEditState(false);
			setState((prev) => ({
				...prev,
				isReordering: false,
				showEditPopup: false,
				selectedTraining: null,
			}));

			await fetchTrainings();

			setState((prev) => ({
				...prev,
				isLoading: false
			}));
		} catch (err) {
			setState((prev) => ({
				...prev,
				isLoading: false
			}));
			alert(`Error: ${err.message}`);
		}
	};

	const handleSaveReorder = async () => {
		try {
			setState((prev) => ({ ...prev, isLoading: true }));

			const token = getToken();
			const order = state.trainingDays.map((t) => t._id);

			localStorage.setItem('trainingOrder', JSON.stringify(order));
			await saveOrderToServer(token, state.trainingDays);

			setState((prev) => ({
				...prev,
				isReordering: false,
				isLoading: false
			}));
		} catch (err) {
			console.error('Error saving order:', err);
			setState((prev) => ({ ...prev, isLoading: false }));

			if (err.response?.status === 404) {
				alert('Order endpoint not found. Order saved locally only.');
			} else {
				alert('Saved locally only. Server error.');
			}

			setState((prev) => ({ ...prev, isReordering: false }));
		}
	};

	const handleToggleEdit = () => {
		if (state.trainingDays.length === 0) {
			alert('No trainings to edit. Please create a training first.');
			return;
		}

		setEditState((prev) => !prev);
		setState((prev) => ({
			...prev,
			isReordering: false
		}));
	};

	const handleToggleReorder = () => {
		if (state.trainingDays.length === 0) {
			alert('No trainings to reorder. Please create a training first.');
			return;
		}

		if (state.trainingDays.length === 1) {
			alert('Need at least 2 trainings to reorder.');
			return;
		}

		setState((prev) => ({
			...prev,
			isReordering: !prev.isReordering
		}));
	};

	const retryLoad = () => {
		fetchTrainings().finally(() => setHasLoadedTrainings(true));
	};

	const showInitialSkeleton = state.isLoading && !hasLoadedTrainings;
	const showLoadError = state.error && !state.isLoading && state.trainingDays.length === 0;

	if (showInitialSkeleton) {
		return (
			<div style={commonStyle.commonSection}>
				<div style={commonStyle.titleHeader}>
					<h2 style={commonStyle.title}>Trainings</h2>
				</div>
				<SectionSkeleton
					showHeader={false}
					cards={3}
					cardHeight={88}
					cardGap={15}
				/>
			</div>
		);
	}

	if (showLoadError) {
		return (
			<div style={commonStyle.commonSection}>
				<div style={commonStyle.titleHeader}>
					<h2 style={commonStyle.title}>Trainings</h2>
				</div>
				<div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '12px' }}>
					<p style={{ color: '#E33C3F' }}>{state.error}</p>
					<button onClick={retryLoad} style={commonStyle.popupCreateButton}>
						Try Again
					</button>
				</div>
			</div>
		);
	}

	return (
		<>
			<div style={commonStyle.commonSection}>
				<div style={commonStyle.titleHeader}>
					<h2 style={commonStyle.title}>Trainings</h2>
					{state.trainingDays.length > 0 && (
						<TrainingControls
							editState={editState}
							isReordering={state.isReordering}
							onToggleEdit={handleToggleEdit}
							onSaveReorder={handleSaveReorder}
						/>
					)}
				</div>

				<ReorderButton
					editState={editState}
					state={state}
					handleToggleReorder={handleToggleReorder}
				/>

				{state.trainingDays.length === 0 && !state.isLoading && (
					<div style={homeStyle.emptyState}>
						<p style={homeStyle.emptyStateText}>
							No trainings yet. Create your first training!
						</p>
					</div>
				)}

				<TrainingList
					state={state}
					setState={setState}
					editState={editState}
					loadScene={loadScene}
				/>

				{!editState && !state.isReordering && (
					<ButtonType
						functionOnClick={() => setState((prev) => ({
							...prev,
							showCreatePopup: true
						}))}
						addStyle={homeStyle.trainingCardAddButton}
					>
						+ Add Training
					</ButtonType>
				)}

				<SavingOrderButton
					editState={editState}
					state={state}
					handleSaveReorder={handleSaveReorder}
				/>
			</div>

			<TrainingPopup
				isOpen={state.showCreatePopup}
				mode="create"
				name={state.newName}
				text={state.newText}
				isLoading={state.isLoading}
				onNameChange={(e) => setState((prev) => ({ ...prev, newName: e.target.value }))}
				onTextChange={(e) => setState((prev) => ({ ...prev, newText: e.target.value }))}
				onClose={() => setState((prev) => ({ ...prev, showCreatePopup: false }))}
				onSubmit={handleCreateSubmit}
			/>

			<TrainingPopup
				isOpen={state.showEditPopup}
				mode="edit"
				training={state.selectedTraining}
				name={state.editName}
				text={state.editText}
				isLoading={state.isLoading}
				onNameChange={(e) => setState((prev) => ({ ...prev, editName: e.target.value }))}
				onTextChange={(e) => setState((prev) => ({ ...prev, editText: e.target.value }))}
				onClose={() => setState((prev) => ({
					...prev,
					showEditPopup: false,
					selectedTraining: null
				}))}
				onSubmit={handleEditSubmit}
				onDelete={() => setShowDeleteModal(true)}
			/>

			<DeleteConfirmationModal
				isOpen={showDeleteModal}
				trainingName={state.selectedTraining?.name}
				isLoading={state.isLoading}
				onConfirm={handleDeleteConfirm}
				onCancel={() => setShowDeleteModal(false)}
			/>
		</>
	);
}
