import mongoose from 'mongoose';
import { sanitizeMuscleGroupName } from '../utils/muscleGroups.js';

const userMuscleGroupSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      set: sanitizeMuscleGroupName,
    },
  },
  { timestamps: true }
);

userMuscleGroupSchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('UserMuscleGroup', userMuscleGroupSchema);
