import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IUser extends Document {
  username: string;
  email: string;
  password: string;
  role: 'Admin' | 'Viewer';
  country?: string;
  currencyCode: string;
  phone: string;
  avatar: string;
  otp?: string;
  otpExpires?: Date;
  shareToken?: string;
  isSharing: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['Admin', 'Viewer'], default: 'Admin' },
  country: { type: String },
  currencyCode: { type: String, default: 'USD' },
  phone: { type: String, default: '' },
  avatar: { type: String, default: '' },
  otp: { type: String },
  otpExpires: { type: Date },
  shareToken: { type: String, unique: true, sparse: true },
  isSharing: { type: Boolean, default: false }
}, { timestamps: true });

// Check if the model exists before creating a new one (important for Next.js hot reloading)
if (process.env.NODE_ENV === 'development') {
  delete mongoose.models.User;
}
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
