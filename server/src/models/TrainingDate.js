import mongoose from 'mongoose';

const trainingDateSchema = new mongoose.Schema(
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
    date: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

trainingDateSchema.index({ trainingFileId: 1, date: 1 }, { unique: true });
trainingDateSchema.index({ userId: 1, trainingFileId: 1, date: 1 });

export default mongoose.model('TrainingDate', trainingDateSchema);
