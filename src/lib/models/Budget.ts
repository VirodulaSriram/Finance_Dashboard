import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: string;
  total: number;
  spent: number;
  color: string;
  createdAt: Date;
  updatedAt: Date;
}

const BudgetSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: String, required: true },
  total: { type: Number, required: true },
  spent: { type: Number, default: 0 },
  color: { type: String, default: 'bg-primary' },
}, { timestamps: true });

const Budget: Model<IBudget> = mongoose.models.Budget || mongoose.model<IBudget>('Budget', BudgetSchema);

export default Budget;
