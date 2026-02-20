import mongoose from 'mongoose';

const trainingFileSchema = new mongoose.Schema(
	{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
			required: true,
			index: true,
		},
		name: {
			type: String,
			required: [true, 'Название тренировки обязательно'],
			trim: true,
		},
		order: {
			type: Number,
			default: 0,
			index: true,
		},
	},
	{ timestamps: true }
);

trainingFileSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('TrainingFile', trainingFileSchema);
