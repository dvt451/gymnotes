import React, { useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { getToken } from '../utils/getToken';
import {
	DEFAULT_MUSCLE_GROUP,
	buildMuscleGroupList,
	normalizeExerciseMuscleGroup,
} from '../pages/exerciseLibrary/muscleGroups';
import Select from './Select.jsx';

export default function MuscleGroupSelect({
	value = DEFAULT_MUSCLE_GROUP,
	onChange,
	style,
	disabled = false,
	options,
}) {
	const { BASE_URL } = useContext(AuthContext);
	const [loadedOptions, setLoadedOptions] = useState([]);

	useEffect(() => {
		if (Array.isArray(options) && options.length > 0) {
			setLoadedOptions(buildMuscleGroupList(options));
			return;
		}

		let isMounted = true;

		const loadMuscleGroups = async () => {
			try {
				const token = getToken();
				if (!token) return;

				const response = await fetch(`${BASE_URL}/api/exercise-library/muscle-groups`, {
					headers: {
						Authorization: `Bearer ${token}`,
					},
				});

				if (!response.ok) return;

				const data = await response.json();
				if (isMounted) {
					setLoadedOptions(buildMuscleGroupList(data?.muscleGroups || []));
				}
			} catch (err) {
				if (isMounted) {
					setLoadedOptions(buildMuscleGroupList([]));
				}
			}
		};

		loadMuscleGroups();

		return () => {
			isMounted = false;
		};
	}, [BASE_URL, options]);

	const selectOptions = useMemo(
		() => buildMuscleGroupList([...(loadedOptions || []), value]),
		[loadedOptions, value]
	);

	return (
		<Select
			options={selectOptions}
			value={normalizeExerciseMuscleGroup(value, selectOptions)}
			onChange={onChange}
			style={style}
			disabled={disabled}
		/>
	);
}
