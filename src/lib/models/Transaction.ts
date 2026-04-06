import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  date: Date;
  amount: number;
  category: string;
  type: 'Income' | 'Expense';
  paymentMethod?: 'UPI' | 'Card' | 'Cash' | 'Net Banking' | 'Other';
  status?: 'Success' | 'Waiting' | 'Declined';
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema: Schema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true },
  date: { type: Date, required: true },
  amount: { type: Number, required: true },
  category: { type: String, required: true },
  type: { type: String, enum: ['Income', 'Expense'], required: true },
  paymentMethod: { type: String, enum: ['UPI', 'Card', 'Cash', 'Net Banking', 'Other'], required: false },
  status: { type: String, enum: ['Success', 'Waiting', 'Declined'], required: false, default: 'Success' },
}, { timestamps: true });

const Transaction: Model<ITransaction> = mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);

export default Transaction;
