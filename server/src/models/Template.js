import mongoose from 'mongoose';

const templateExerciseSchema = new mongoose.Schema(
  {
    exerciseUserLibraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExerciseUserLibrary',
      required: true,
    },
  },
  { _id: true }
);

const templateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    trainingFileId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingFile',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Название шаблона обязательно'],
      trim: true,
    },
    exercises: {
      type: [templateExerciseSchema],
      default: [],
    },
  },
  { timestamps: true }
);

templateSchema.index({ userId: 1, trainingFileId: 1, name: 1 }, { unique: true });

export default mongoose.model('Template', templateSchema);
