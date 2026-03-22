import TrainingFile from '../models/TrainingFile.js';
import TrainingDate from '../models/TrainingDate.js';
import ExerciseEntry from '../models/ExerciseEntry.js';
import Template from '../models/Template.js';
import ExerciseUserLibrary from '../models/ExerciseUserLibrary.js';
import UserMuscleGroup from '../models/UserMuscleGroup.js';

export const deleteUserData = async (userId) => {
	await Promise.all([
		TrainingFile.deleteMany({ userId }),
		TrainingDate.deleteMany({ userId }),
		ExerciseEntry.deleteMany({ userId }),
		Template.deleteMany({ userId }),
		ExerciseUserLibrary.deleteMany({ userId }),
		UserMuscleGroup.deleteMany({ userId }),
	]);
};
