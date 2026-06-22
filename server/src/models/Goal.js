import mongoose from 'mongoose';

const goalSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		exerciseUserLibraryId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'ExerciseUserLibrary',
			default: null,
		},
		exerciseName: {
			type: String,
			required: [true, 'Exercise name is required'],
			trim: true,
		},
		targetWeight: {
			type: Number,
			required: [true, 'Target weight is required'],
			min: [0, 'Target weight must be a positive number'],
		},
		targetSets: {
			type: Number,
			default: 1,
			min: [1, 'Target sets must be at least 1'],
		},
		targetReps: {
			type: Number,
			default: 0,
			min: [0, 'Target reps must be 0 or more'],
		},
		notes: {
			type: String,
			trim: true,
			default: '',
			maxlength: [1000, 'Notes cannot exceed 1000 characters'],
		},
	},
	{ timestamps: true }
);

goalSchema.index({ userId: 1, exerciseName: 1 });

export default mongoose.model('Goal', goalSchema);
