import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';
import { getToken } from '../../../components/utils/getToken';

export function useDateListLogic(trainingId, trainingText, trainingTitle) {
	const [datesByTraining, setDatesByTraining] = useState({});
	const [showPicker, setShowPicker] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState(null);
	const { BASE_URL } = useContext(AuthContext);
	const navigate = useNavigate();

	// Функция загрузки дат
	const fetchDates = useCallback(async () => {
		if (!trainingId) return;

		try {
			setIsLoading(true);
			setError(null);

			const token = localStorage.getItem('token');
			if (!token) {
				setError('Требуется авторизация');
				navigate('/login');
				return;
			}

			// Загружаем тренировку и ее даты
			const res = await fetch(`${BASE_URL}/api/trainings/${trainingId}`, {
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				throw new Error(`Ошибка ${res.status}: Не удалось загрузить тренировку`);
			}

			const training = await res.json();

			// Обрабатываем разные форматы ответа
			let datesArray = [];

			if (training && training.dates && Array.isArray(training.dates)) {
				// Формат: { ..., dates: [...] }
				datesArray = training.dates;
			} else if (training && Array.isArray(training)) {
				// Формат: [{...}, {...}] - массив дат напрямую
				datesArray = training;
			} else if (training && training.success && training.dates) {
				// Формат: { success: true, dates: [...] }
				datesArray = training.dates;
			}

			const formattedDates = datesArray.map(dateItem => ({
				id: dateItem._id || dateItem.id,
				_id: dateItem._id || dateItem.id,
				date: dateItem.date ? dateItem.date.split('T')[0] : '',
				exercises: dateItem.exercises || []
			}));

			setDatesByTraining(prev => ({
				...prev,
				[trainingId]: formattedDates,
			}));

		} catch (err) {
			console.error('Error loading training:', err);
			setError(err.message);
		} finally {
			setIsLoading(false);
		}
	}, [trainingId, BASE_URL, navigate]);

	// Загрузка дат при монтировании
	useEffect(() => {
		fetchDates();
	}, [fetchDates]);

	// Функция добавления даты
	const addDate = async (dateStr) => {
		try {
			setIsLoading(true);
			setError(null);

			const current = datesByTraining[trainingId] || [];
			if (current.some(d => d.date === dateStr)) {
				const errorMsg = 'Эта дата уже существует';
				throw new Error(errorMsg);
			}

			const token = localStorage.getItem('token');
			if (!token) {
				setError('Требуется авторизация');
				navigate('/login');
				return;
			}

			const isoDate = new Date(dateStr).toISOString();

			const endpoint = `${BASE_URL}/api/trainings/${trainingId}/dates`;

			const res = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ date: isoDate, exercises: [] }),
			});


			if (!res.ok) {
				const errorText = await res.text();
				console.error('Full error response:', errorText);
				throw new Error(errorText || `HTTP error ${res.status}`);
			}

			const result = await res.json();

			let newDatesArray = [];

			if (result && result.dates && Array.isArray(result.dates)) {
				newDatesArray = result.dates;
			} else if (result && Array.isArray(result)) {
				newDatesArray = result;
			} else if (result && result.date) {
				const existingDates = datesByTraining[trainingId] || [];
				newDatesArray = [...existingDates, result];
			}

			const formattedDates = newDatesArray.map(dateItem => ({
				id: dateItem._id || dateItem.id,
				_id: dateItem._id || dateItem.id,
				date: dateItem.date ? dateItem.date.split('T')[0] : '',
				exercises: dateItem.exercises || []
			}));

			setDatesByTraining(prev => ({
				...prev,
				[trainingId]: formattedDates
			}));

		} catch (err) {
			setError(err.message.includes('Файл не найден')
				? 'Ошибка: Неверный адрес API'
				: `Ошибка: ${err.message}`);
			throw err; // пробрасываем дальше, чтобы onAdd понял, что произошла ошибка
		} finally {
			setIsLoading(false);
		}
	};

	const updateDate = async (dateId, newDate) => {
		try {
			setIsLoading(true);
			setError(null);

			// 1. Локальная проверка дубликата (исключаем текущую дату)
			const currentDates = datesByTraining[trainingId] || [];
			const isDuplicate = currentDates.some(d => d._id !== dateId && d.date === newDate);
			if (isDuplicate) {
				const errorMsg = 'Эта дата уже существует';
				setError(errorMsg);
				throw new Error(errorMsg); // ← важно выбросить исключение
			}

			// 2. Получаем токен
			const token = localStorage.getItem('token');
			if (!token) {
				setError('Требуется авторизация');
				navigate('/login');
				return;
			}

			// 3. Отправляем запрос на сервер
			const res = await fetch(`${BASE_URL}/api/trainings/${trainingId}/dates/${dateId}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`,
				},
				body: JSON.stringify({ date: newDate }),
			});


			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.message || 'Ошибка обновления даты');
			}


			// 4. Обновляем локальное состояние (без перезагрузки)
			setDatesByTraining(prev => ({
				...prev,
				[trainingId]: prev[trainingId].map(d =>
					d._id === dateId ? { ...d, date: newDate } : d
				)
			}));

		} catch (err) {
			setError(err.message);
			throw err; // ← обязательно пробрасываем дальше, чтобы handleUpdate поймал
		} finally {
			setIsLoading(false);
		}
	};

	// Функция удаления даты
	const deleteDate = async (dateId) => {
		if (!window.confirm('Удалить эту дату? Вы уверены?')) {
			return;
		}

		try {
			setIsLoading(true);
			setError(null);

			const token = await getToken(); // используем getToken
			const endpoint = `${BASE_URL}/api/trainings/${trainingId}/dates/${dateId}`;

			const res = await fetch(endpoint, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			if (!res.ok) {
				const errorText = await res.text();
				throw new Error(errorText || `HTTP error ${res.status}`);
			}

			// Удаляем дату из локального состояния
			setDatesByTraining(prev => ({
				...prev,
				[trainingId]: prev[trainingId].filter(d => d._id !== dateId)
			}));

		} catch (err) {
			console.error('Error deleting date:', err);
			setError('Не удалось удалить дату: ' + err.message);
		} finally {
			setIsLoading(false);
		}
	};

	// Функция открытия деталей дня
	const openDayDetails = (date) => {
		navigate(`/exercises/${trainingId}/${date}`, {
			state: {
				trainingText: trainingText,
				trainingTitle: trainingTitle
			}
		});
	};

	// Функция для обновления дат (принудительная перезагрузка)
	const refreshDates = () => {
		fetchDates();
	};

	return {
		datesByTraining,
		showPicker,
		setShowPicker,
		selectedDate,
		setSelectedDate,
		addDate,
		deleteDate,
		openDayDetails,
		isLoading,
		error,
		refreshDates,
		updateDate
	};
}