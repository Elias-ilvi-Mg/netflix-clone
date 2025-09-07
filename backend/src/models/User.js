import mongoose from 'mongoose'


const ProfileSchema = new mongoose.Schema({
id: { type: String, default: () => new mongoose.Types.ObjectId().toString() },
name: { type: String, required: true },
kids: { type: Boolean, default: false }
}, { _id: false })


const SavedItemSchema = new mongoose.Schema({
id: { type: String, required: true },
title: String,
poster: String,
backdrop: String,
year: String,
vote: Number,
type: { type: String, enum: ['movie','tv'], default: 'movie' }
}, { _id: false })


const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true, required: true, index: true },
  passwordHash: { type: String, required: true },
  role: { type: String, enum: ['user','admin'], default: 'user' }, // ⬅️ NEW
  profiles: { type: [ProfileSchema], default: [{ name: 'Primary', kids: false }] },
  activeProfileId: { type: String, default: null },
  myList: { type: [SavedItemSchema], default: [] },
  verified: { type: Boolean, default: false },

}, { timestamps: true })

export const User = mongoose.model('User', UserSchema)
