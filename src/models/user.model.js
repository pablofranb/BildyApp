import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      trim: true,
      default: null
    },
    lastName: {
      type: String,
      trim: true,
      default: null
    },
    nif: {
      type: String,
      trim: true,
      uppercase: true,
      default: null
    },
    role: {
      type: String,
      enum: ['admin', 'guest'],
      default: 'admin'
    },
    status: {
      type: String,
      enum: ['pending', 'verified'],
      default: 'pending'
    },
    verificationCode: {
      type: String,
      default: null
    },
    verificationAttempts: {
      type: Number,
      default: 3
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      default: null
    },
    address: {
      street: { type: String, trim: true, default: null },
      number: { type: String, trim: true, default: null },
      postal: { type: String, trim: true, default: null },
      city: { type: String, trim: true, default: null },
      province: { type: String, trim: true, default: null }
    },
    deleted: {
      type: Boolean,
      default: false
    },
    refreshToken: {
      type: String,
      default: null
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

userSchema.virtual('fullName').get(function () {
  return `${this.name || ''} ${this.lastName || ''}`.trim();
});

userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ company: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);

export default User;
