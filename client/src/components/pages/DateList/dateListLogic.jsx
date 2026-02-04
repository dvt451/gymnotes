import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../../context/AuthContext';

export function useDateListLogic(trainingId, setDatesByTraining, trainingText, trainingTitle) {
	const [datesByTraining, setLocalDatesByTraining] = useState({});
	const [showPicker, setShowPicker] = useState(false);
	const [selectedDate, setSelectedDate] = useState(new Date());
	const { BASE_URL } = useContext(AuthContext);
	const navigate = useNavigate();

	useEffect(() => {
		if (!trainingId) return;

		async function fetchTraining() {
			try {
				const token = localStorage.getItem('token');
				const res = await fetch(`${BASE_URL}/api/trainings/${trainingId}`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});
				if (!res.ok) throw new Error(`Error ${res.status}`);

				const training = await res.json();

				const dates = training.dates.map(dateItem => ({
					id: dateItem._id,
					date: dateItem.date.split('T')[0],
				}));

				setLocalDatesByTraining(prev => ({
					...prev,
					[trainingId]: dates,
				}));

				if (setDatesByTraining) setDatesByTraining(prev => ({ ...prev, [trainingId]: dates }));
			} catch (err) {
				console.error('Error loading training:', err);
			}
		}

		fetchTraining();
	}, [trainingId, BASE_URL, setDatesByTraining]);
	const addDate = async (dateStr) => {
		try {
			const current = datesByTraining[trainingId] || [];
			if (current.some(d => d.date === dateStr)) {
				return window.alert('Эта дата уже существует');
			}

			const token = localStorage.getItem('token');
			if (!token) {
				return window.alert('Требуется авторизация');
			}

			// 1. Verify the date format
			const isoDate = new Date(dateStr).toISOString();
			console.log('Formatted date:', isoDate);

			// 2. Verify the full endpoint URL
			const endpoint = `${BASE_URL}/api/trainings/${trainingId}/dates`;
			console.log('API Endpoint:', endpoint);

			// 3. Make the request with detailed logging
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

			const updatedTraining = await res.json();
			console.log('Updated training:', updatedTraining);

			// Update state
			const dates = updatedTraining.dates.map(d => ({
				id: d._id,
				date: d.date.split('T')[0]
			}));

			setLocalDatesByTraining(prev => ({
				...prev,
				[trainingId]: dates
			}));

		} catch (err) {
			console.error('Full error:', err);
			window.alert(err.message.includes('Файл не найден')
				? 'Ошибка: Неверный адрес API'
				: `Ошибка: ${err.message}`);
			console.log('Текущий BASE_URL:', BASE_URL);
		}
	};


	const deleteDate = async (id) => {
		if (window.confirm('Delete? Are you sure?')) {
			try {
				const token = localStorage.getItem('token');
				const res = await fetch(`${BASE_URL}/api/trainings/${trainingId}/dates/${id}`, {
					method: 'DELETE',
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!res.ok) throw new Error(`Error ${res.status}`);

				const updatedTraining = await res.json();
				const dates = updatedTraining.dates.map(dateItem => ({
					id: dateItem._id,
					date: dateItem.date.split('T')[0],
				}));

				setLocalDatesByTraining(prev => ({
					...prev,
					[trainingId]: dates,
				}));

				if (setDatesByTraining) setDatesByTraining(prev => ({ ...prev, [trainingId]: dates }));
			} catch (err) {
				console.error('Error deleting date:', err);
				window.alert('Failed to delete date');
			}
		}
	};

	// В компоненте, где вызывается openDayDetails:
	const openDayDetails = (date) => {
		navigate(`/exercises/${trainingId}/${date}`, {
			state: {
				trainingText: trainingText,
				trainingTitle: trainingTitle
			}
		});


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
	};
}