import { useState, useCallback } from 'react';
import axios from 'axios';

export const useTrainings = (BASE_URL, userToken) => {
	const [state, setState] = useState({
		trainingDays: [],
		showCreatePopup: false,
		showEditPopup: false,
		selectedTraining: null,
		newName: '',
		newText: '',
		editName: '',
		editText: '',
		isLoading: false,
		error: null,
		isReordering: false,
	});

	// useTrainings.js - исправленная версия
	const fetchTrainings = useCallback(async (forceRefresh = false) => {
		try {
			if (!userToken) throw new Error('Пользователь не авторизован');

			setState(prev => ({ ...prev, isLoading: true, error: null }));

			// Получаем свежие данные с сервера
			const response = await axios.get(`${BASE_URL}/api/trainings`, {
				headers: { Authorization: `Bearer ${userToken}` }
			});

			// Если не форсируем обновление и уже есть тренировки, сохраняем текущий порядок
			if (!forceRefresh && state.trainingDays.length > 0) {
				console.log('🟡 Keeping current order, not applying saved order');
				setState(prev => ({
					...prev,
					isLoading: false
				}));
				return;
			}

			// Применяем сохраненный порядок только при первой загрузке или forceRefresh
			const savedOrder = localStorage.getItem('trainingOrder');
			let orderedTrainings = response.data;

			if (savedOrder) {
				try {
					const order = JSON.parse(savedOrder);

					// Создаем карту для быстрого доступа
					const trainingMap = {};
					response.data.forEach(t => {
						trainingMap[t._id] = t;
					});

					// Собираем в порядке из localStorage
					const ordered = [];
					const unordered = [];

					order.forEach(id => {
						if (trainingMap[id]) {
							ordered.push(trainingMap[id]);
							delete trainingMap[id];
						}
					});

					// Добавляем новые тренировки
					Object.values(trainingMap).forEach(training => {
						unordered.push(training);
					});

					orderedTrainings = [...ordered, ...unordered];

				} catch (parseErr) {
					console.error('Error parsing localStorage order:', parseErr);
				}
			}

			setState(prev => ({
				...prev,
				trainingDays: orderedTrainings,
				isLoading: false
			}));

		} catch (err) {
			console.error('Ошибка при загрузке тренировок:', err);
			setState(prev => ({
				...prev,
				isLoading: false,
				error: err.response?.data?.message || err.message
			}));
		}
	}, [userToken, BASE_URL]); // ⚠️ Убрали зависимость от isReordering!

	// 🔄 Новая функция для применения сохраненного порядка
	const applySavedOrder = useCallback(() => {
		const savedOrder = localStorage.getItem('trainingOrder');
		if (!savedOrder || state.trainingDays.length === 0) return;

		try {
			const order = JSON.parse(savedOrder);

			// Создаем карту текущих тренировок
			const trainingMap = {};
			state.trainingDays.forEach(t => {
				trainingMap[t._id] = t;
			});

			// Собираем в порядке из localStorage
			const ordered = [];
			const unordered = [];

			order.forEach(id => {
				if (trainingMap[id]) {
					ordered.push(trainingMap[id]);
					delete trainingMap[id];
				}
			});

			// Добавляем тренировки, которых нет в порядке
			Object.values(trainingMap).forEach(training => {
				unordered.push(training);
			});

			const orderedTrainings = [...ordered, ...unordered];

			setState(prev => ({
				...prev,
				trainingDays: orderedTrainings
			}));

			console.log('🟢 Applied saved order from localStorage');

		} catch (err) {
			console.error('Error applying saved order:', err);
		}
	}, [state.trainingDays]);

	const createTraining = async (token, name, text) => {
		try {
			setState(prev => ({ ...prev, isLoading: true }));

			await axios.post(`${BASE_URL}/api/trainings`, {
				name,
				text: text.trim() || ''
			}, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				}
			});

			return true;
		} catch (err) {
			console.error('Ошибка при создании:', err);
			setState(prev => ({ ...prev, isLoading: false, error: err.message }));
			throw err;
		}
	};

	const updateTraining = async (token, trainingId, name, text) => {
		try {
			setState(prev => ({ ...prev, isLoading: true }));

			await axios.put(`${BASE_URL}/api/trainings/${trainingId}`, {
				name,
				text: text.trim() || ''
			}, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				}
			});

			return true;
		} catch (err) {
			console.error('Ошибка при обновлении:', err);
			setState(prev => ({ ...prev, isLoading: false, error: err.message }));
			throw err;
		}
	};

	const deleteTraining = async (token, trainingId) => {
		try {
			setState(prev => ({ ...prev, isLoading: true }));

			await axios.delete(`${BASE_URL}/api/trainings/${trainingId}`, {
				headers: { Authorization: `Bearer ${token}` }
			});

			return true;
		} catch (err) {
			console.error('Ошибка при удалении:', err);
			setState(prev => ({ ...prev, isLoading: false, error: err.message }));
			throw err;
		}
	};

	const saveOrderToServer = async (token, trainings) => {
		try {
			const order = trainings.map(t => t._id);

			// Проверьте правильный ли URL
			const response = await axios.post(`${BASE_URL}/api/trainings/order`, {
				order
			}, {
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				}
			});

			console.log('Order saved successfully:', response.data);
			return true;
		} catch (err) {
			console.error('Error saving order:', err.response?.data || err.message);
			throw err;
		}
	};

	return {
		state,
		setState,
		fetchTrainings,
		createTraining,
		updateTraining,
		deleteTraining,
		saveOrderToServer,
		applySavedOrder
	};
};