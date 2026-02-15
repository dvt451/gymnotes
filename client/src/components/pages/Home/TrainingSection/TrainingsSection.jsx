import React, { useState, useEffect, useContext } from 'react';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { AuthContext } from '../../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../../../utils/getToken';
import { useTrainings } from './hooks/useTrainings';
import SortableTrainingCard from './SortableTrainingCard';
import TrainingCard from './TrainingCard';
import TrainingControls from './TrainingControls';
import TrainingPopup from './TrainingPopup';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { colors, createCommonStyle } from '../../../../styles/commonStyle';
import { createHomeStyle } from '../homeStyles';
import axios from 'axios';
import { GlobalContext } from '../../../../context/GlobalContext';

export default function TrainingsSection() {
	const navigate = useNavigate();
	const { userToken, BASE_URL } = useContext(AuthContext);
	const [editState, setEditState] = useState(false);
	const [showDeleteModal, setShowDeleteModal] = useState(false);
	const { mainColor } = useContext(GlobalContext);

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

	const sensors = useSensors(
		useSensor(PointerSensor),
		useSensor(KeyboardSensor, {
			coordinateGetter: sortableKeyboardCoordinates,
		})
	);

	// Загрузка тренировок при монтировании
	useEffect(() => {
		if (userToken) fetchTrainings();
	}, [userToken, fetchTrainings]);

	// 🔄 Автоматический сброс editState и isReordering при пустом массиве тренировок
	useEffect(() => {
		if (state.trainingDays.length === 0 && (editState || state.isReordering)) {
			console.log('🔄 No trainings left, resetting edit states');
			setEditState(false);
			setState(prev => ({
				...prev,
				isReordering: false,
				showEditPopup: false,
				selectedTraining: null
			}));
		}
	}, [state.trainingDays.length, editState, state.isReordering, setState]);

	const loadScene = (item) => {
		navigate(`/date-list/${item._id}`, {
			state: {
				trainingText: item.text,
				trainingTitle: item.name
			}
		});
	};

	const handleTrainingClick = (item) => {
		if (editState) {
			setState(prev => ({
				...prev,
				showEditPopup: true,
				selectedTraining: item,
				editName: item.name,
				editText: item.text || ''
			}));
		} else {
			loadScene(item);
		}
	};

	const handleCreateSubmit = async () => {
		try {
			const token = getToken();
			await createTraining(token, state.newName, state.newText);

			setState(prev => ({
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

			setState(prev => ({
				...prev,
				showEditPopup: false,
				selectedTraining: null
			}));

			await fetchTrainings();
		} catch (err) {
			alert(`Error: ${err.message}`);
		}
	};

	// 🚨 ОБНОВЛЕННАЯ ФУНКЦИЯ УДАЛЕНИЯ С ПРОВЕРКОЙ
	const handleDeleteConfirm = async () => {
		try {
			// 🆕 Устанавливаем isLoading: true перед началом операции
			setState(prev => ({
				...prev,
				isLoading: true
			}));

			const token = getToken();
			await deleteTraining(token, state.selectedTraining._id);

			setShowDeleteModal(false);
			setState(prev => ({
				...prev,
				showEditPopup: false,
				selectedTraining: null,
				// 🆕 Оставляем isLoading: true пока загружаем обновленный список
			}));

			// Загружаем обновленный список
			await fetchTrainings();

			// 🆕 После завершения загрузки устанавливаем isLoading: false
			setState(prev => ({
				...prev,
				isLoading: false
			}));

			// useEffect выше автоматически сбросит состояния если массив пуст

		} catch (err) {
			// 🆕 В случае ошибки тоже устанавливаем isLoading: false
			setState(prev => ({
				...prev,
				isLoading: false
			}));
			alert(`Error: ${err.message}`);
		}
	};

	const saveOrderToLocalStorage = (trainings) => {
		const order = trainings.map(t => t._id);
		localStorage.setItem('trainingOrder', JSON.stringify(order));
	};

	const handleDragEnd = (event) => {
		const { active, over } = event;

		if (active.id !== over.id) {
			setState((prev) => {
				const oldIndex = prev.trainingDays.findIndex((t) => t._id === active.id);
				const newIndex = prev.trainingDays.findIndex((t) => t._id === over.id);

				const newOrder = arrayMove(prev.trainingDays, oldIndex, newIndex);

				// Сохраняем только в localStorage при перетаскивании
				saveOrderToLocalStorage(newOrder);

				return {
					...prev,
					trainingDays: newOrder,
				};
			});
		}
	};

	// Обработчик сохранения порядка
	const handleSaveReorder = async () => {
		try {
			setState(prev => ({ ...prev, isLoading: true }));

			const token = getToken();
			const order = state.trainingDays.map(t => t._id);

			// Сохраняем в localStorage
			localStorage.setItem('trainingOrder', JSON.stringify(order));

			// Сохраняем на сервер
			await saveOrderToServer(token, state.trainingDays);

			// Выходим из режима перетаскивания
			setState(prev => ({
				...prev,
				isReordering: false,
				isLoading: false
			}));

			console.log('✅ Order saved successfully');

		} catch (err) {
			console.error('Error saving order:', err);
			setState(prev => ({ ...prev, isLoading: false }));

			// Показываем пользователю информацию
			if (err.response?.status === 404) {
				alert('⚠️ Order endpoint not found. Order saved locally only.');
			} else {
				alert('⚠️ Saved locally only. Server error.');
			}

			// Все равно выходим из режима
			setState(prev => ({ ...prev, isReordering: false }));
		}
	};

	// 🚨 ПРЕДУПРЕЖДЕНИЕ: проверка перед входом в режим редактирования если массив пуст
	const handleToggleEdit = () => {
		if (state.trainingDays.length === 0) {
			alert('No trainings to edit. Please create a training first.');
			return;
		}
		setEditState(!editState);
		setState(prev => ({
			...prev,
			isReordering: false
		}));
	};

	// 🚨 ПРЕДУПРЕЖДЕНИЕ: проверка перед входом в режим перетаскивания
	const handleToggleReorder = () => {
		if (state.trainingDays.length === 0) {
			alert('No trainings to reorder. Please create a training first.');
			return;
		}
		if (state.trainingDays.length === 1) {
			alert('Need at least 2 trainings to reorder.');
			return;
		}
		setState(prev => ({
			...prev,
			isReordering: !prev.isReordering
		}));
	};

	if (state.isLoading) {
		return <div style={commonStyle.center}>Loading...</div>;
	}

	if (state.error) {
		return (
			<div style={commonStyle.center}>
				<p style={commonStyle.error}>{state.error}</p>
				<button onClick={() => fetchTrainings()} style={commonStyle.button}>
					Try Again
				</button>
			</div>
		);
	}

	return (
		<div style={homeStyle.trainingBlock}>
			<div style={commonStyle.titleHeader}>
				<h2 style={commonStyle.title}>Trainings</h2>
				{state.trainingDays.length > 0 && <TrainingControls
					editState={editState}
					isReordering={state.isReordering}
					onToggleEdit={handleToggleEdit} // 🚨 Используем обновленную функцию
					onSaveReorder={handleSaveReorder}
				/>}
			</div>

			{/* Кнопка Reorder показывается только если есть тренировки и включен editState */}
			{editState && state.trainingDays.length > 1 && (
				<div style={commonStyle.titleHeader}>
					<button
						onClick={handleToggleReorder} // 🚨 Используем обновленную функцию
						disabled={state.isLoading}
						style={{
							...commonStyle.EditButton,
							backgroundColor: state.isReordering ? colors.purple : 'transparent',
							opacity: state.isLoading ? 0.5 : 1
						}}
					>
						<span style={{
							...commonStyle.EditButtonText,
							color: state.isReordering ? colors.blueLight : '#fff',
							opacity: state.isReordering ? 1 : 0.25
						}}>
							{state.isReordering ? 'Reordering...' : 'Reorder'}
						</span>
						{state.isReordering ?
							<img src="/img/icons/editblue.png" alt="Edit icon" style={commonStyle.EditIcon} />
							: <img src="/img/icons/edit.png" alt="Edit icon" style={commonStyle.EditIcon} />
						}
					</button>
				</div>
			)}

			{/* Сообщение если тренировок нет */}
			{state.trainingDays.length === 0 && !state.isLoading && (
				<div style={homeStyle.emptyState}>
					<p style={homeStyle.emptyStateText}>
						No trainings yet. Create your first training!
					</p>
				</div>
			)}

			{/* Список тренировок показывается только если они есть */}
			{state.trainingDays.length > 0 && (
				<>
					{state.isReordering ? (
						<DndContext
							sensors={sensors}
							collisionDetection={closestCenter}
							onDragEnd={handleDragEnd}
						>
							<SortableContext
								items={state.trainingDays.map(t => t._id)}
								strategy={verticalListSortingStrategy}
							>
								<div style={homeStyle.trainingList}>
									{state.trainingDays.map((item) => (
										<SortableTrainingCard
											key={item._id}
											item={item}
											editState={editState}
											onEditClick={handleTrainingClick}
										/>
									))}
								</div>
							</SortableContext>
						</DndContext>
					) : (
						<div style={homeStyle.trainingList}>
							{state.trainingDays.map(item => (
								<TrainingCard
									key={item._id}
									item={item}
									editState={editState}
									onClick={handleTrainingClick}
								/>
							))}
						</div>
					)}
				</>
			)}

			{/* Кнопка добавления показывается всегда */}
			{!editState && !state.isReordering && (
				<button
					onClick={() => setState(prev => ({
						...prev,
						showCreatePopup: true
					}))}
					style={{
						...commonStyle.button,
						...homeStyle.trainingCardAddButton
					}}
				>
					+ Add Training
				</button>
			)}

			{/* Кнопка сохранения порядка показывается только при перетаскивании */}
			{editState && state.isReordering && (
				<button
					onClick={handleSaveReorder}
					disabled={state.isLoading}
					style={{
						...commonStyle.button,
						...homeStyle.trainingCardAddButton,
						opacity: state.isLoading ? 0.7 : 1,
					}}
				>
					{state.isLoading ? '💾 Saving...' : '💾 Save Order'}
				</button>
			)}

			{/* Попапы */}
			<TrainingPopup
				isOpen={state.showCreatePopup}
				mode="create"
				name={state.newName}
				text={state.newText}
				isLoading={state.isLoading}
				onNameChange={(e) => setState(prev => ({ ...prev, newName: e.target.value }))}
				onTextChange={(e) => setState(prev => ({ ...prev, newText: e.target.value }))}
				onClose={() => setState(prev => ({ ...prev, showCreatePopup: false }))}
				onSubmit={handleCreateSubmit}
			/>

			<TrainingPopup
				isOpen={state.showEditPopup}
				mode="edit"
				training={state.selectedTraining}
				name={state.editName}
				text={state.editText}
				isLoading={state.isLoading}
				onNameChange={(e) => setState(prev => ({ ...prev, editName: e.target.value }))}
				onTextChange={(e) => setState(prev => ({ ...prev, editText: e.target.value }))}
				onClose={() => setState(prev => ({
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
		</div>
	);
}