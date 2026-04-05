import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  target: number;
  current: number;
  deadline: string;
  priority: 'High' | 'Medium' | 'Low' | 'Critical';
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const GoalSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  target: { type: Number, required: true },
  current: { type: Number, default: 0 },
  deadline: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low', 'Critical'], default: 'Medium' },
  color: { type: String, default: 'from-primary to-secondary' },
}, { timestamps: true });

const Goal: Model<IGoal> = mongoose.models.Goal || mongoose.model<IGoal>('Goal', GoalSchema);

export default Goal;
