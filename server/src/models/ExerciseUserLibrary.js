import mongoose from 'mongoose';
import {
  DEFAULT_MUSCLE_GROUP,
  DEFAULT_MUSCLE_GROUPS as MUSCLE_GROUPS,
  normalizeMuscleGroup,
  sanitizeMuscleGroupName,
} from '../utils/muscleGroups.js';

const exerciseUserLibrarySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Название упражнения обязательно'],
      trim: true,
    },
    muscleGroup: {
      type: String,
      default: DEFAULT_MUSCLE_GROUP,
      set: sanitizeMuscleGroupName,
    },
  },
  { timestamps: true }
);

exerciseUserLibrarySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('ExerciseUserLibrary', exerciseUserLibrarySchema);
export { DEFAULT_MUSCLE_GROUP, MUSCLE_GROUPS, normalizeMuscleGroup };
