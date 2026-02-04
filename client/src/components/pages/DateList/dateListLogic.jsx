import { useState, useEffect, useContext, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

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
				setError('Эта дата уже существует');
				return;
			}

			const token = localStorage.getItem('token');
			if (!token) {
				setError('Требуется авторизация');
				navigate('/login');
				return;
			}

			// 1. Форматируем дату
			const isoDate = new Date(dateStr).toISOString();
			console.log('Formatted date:', isoDate);

			// 2. Формируем endpoint
			const endpoint = `${BASE_URL}/api/trainings/${trainingId}/dates`;
			console.log('API Endpoint:', endpoint);

			// 3. Отправляем запрос
			const res = await fetch(endpoint, {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({
					date: isoDate,
					exercises: []
				}),
			});

			console.log('Response status:', res.status);

			if (!res.ok) {
				const errorText = await res.text();
				console.error('Full error response:', errorText);
				throw new Error(errorText || `HTTP error ${res.status}`);
			}

			const result = await res.json();
			console.log('Server response:', result);

			// 4. Обрабатываем ответ сервера
			let newDatesArray = [];

			if (result && result.dates && Array.isArray(result.dates)) {
				// Формат: { success: true, dates: [...] }
				newDatesArray = result.dates;
			} else if (result && Array.isArray(result)) {
				// Формат: [{...}, {...}] - массив дат напрямую
				newDatesArray = result;
			} else if (result && result.date) {
				// Формат: { date: ..., exercises: ..., _id: ... } - одна дата
				// Нужно добавить к существующим датам
				const existingDates = datesByTraining[trainingId] || [];
				newDatesArray = [...existingDates, result];
			}

			// 5. Форматируем даты для отображения
			const formattedDates = newDatesArray.map(dateItem => ({
				id: dateItem._id || dateItem.id,
				_id: dateItem._id || dateItem.id,
				date: dateItem.date ? dateItem.date.split('T')[0] : '',
				exercises: dateItem.exercises || []
			}));

			// 6. Обновляем состояние
			setDatesByTraining(prev => ({
				...prev,
				[trainingId]: formattedDates
			}));

		} catch (err) {
			console.error('Full error:', err);
			setError(err.message.includes('Файл не найден')
				? 'Ошибка: Неверный адрес API'
				: `Ошибка: ${err.message}`);
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

			const token = localStorage.getItem('token');
			if (!token) {
				setError('Требуется авторизация');
				navigate('/login');
				return;
			}

			const endpoint = `${BASE_URL}/api/trainings/${trainingId}/dates/${dateId}`;
			console.log('Delete endpoint:', endpoint);

			const res = await fetch(endpoint, {
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token}`,
				},
			});

			console.log('Delete response status:', res.status);

			if (!res.ok) {
				const errorText = await res.text();
				console.error('Delete error response:', errorText);
				throw new Error(errorText || `HTTP error ${res.status}`);
			}

			const result = await res.json();
			console.log('Delete result:', result);

			// Обрабатываем ответ сервера
			let updatedDatesArray = [];

			if (result && result.dates && Array.isArray(result.dates)) {
				// Формат: { success: true, dates: [...] }
				updatedDatesArray = result.dates;
			} else if (result && Array.isArray(result)) {
				// Формат: [{...}, {...}] - массив дат напрямую
				updatedDatesArray = result;
			} else {
				// Если сервер не вернул обновленный список, перезагружаем данные
				await fetchDates();
				return;
			}

			// Форматируем даты для отображения
			const formattedDates = updatedDatesArray.map(dateItem => ({
				id: dateItem._id || dateItem.id,
				_id: dateItem._id || dateItem.id,
				date: dateItem.date ? dateItem.date.split('T')[0] : '',
				exercises: dateItem.exercises || []
			}));

			// Обновляем состояние
			setDatesByTraining(prev => ({
				...prev,
				[trainingId]: formattedDates,
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
		refreshDates
	};
}