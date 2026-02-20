import mongoose from 'mongoose';

const weightSetSchema = new mongoose.Schema(
  {
    weight: {
      type: Number,
      required: true,
      min: 0,
    },
    sets: {
      type: [Number],
      default: [],
      validate: {
        validator(values) {
          return values.every((v) => Number.isFinite(v) && v >= 0);
        },
        message: 'Каждое значение в sets должно быть числом >= 0',
      },
    },
  },
  { _id: true }
);

const exerciseEntrySchema = new mongoose.Schema(
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
    trainingDateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'TrainingDate',
      required: true,
      index: true,
    },
    exerciseUserLibraryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ExerciseUserLibrary',
      required: true,
      index: true,
    },
    weights: {
      type: [weightSetSchema],
      default: [],
    },
  },
  { timestamps: true }
);

exerciseEntrySchema.index({ trainingDateId: 1, exerciseUserLibraryId: 1 }, { unique: true });
exerciseEntrySchema.index({ userId: 1, trainingFileId: 1, trainingDateId: 1 });

export default mongoose.model('ExerciseEntry', exerciseEntrySchema);
