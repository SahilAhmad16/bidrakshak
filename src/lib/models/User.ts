import mongoose, { Schema, Document } from 'mongoose';
import { UserRole } from '@/types';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  companyName?: string;
  pan?: string;
  gstin?: string;
  udyamNumber?: string;
  contactNumber?: string;
  address?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['officer', 'bidder', 'admin'], default: 'officer' },
  companyName: { type: String, default: '' },
  pan: { type: String, default: '' },
  gstin: { type: String, default: '' },
  udyamNumber: { type: String, default: '' },
  contactNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
}, { strict: false });

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
