import mongoose from 'mongoose';

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
  },
  { timestamps: true }
);

exerciseUserLibrarySchema.index({ userId: 1, name: 1 }, { unique: true });

export default mongoose.model('ExerciseUserLibrary', exerciseUserLibrarySchema);
