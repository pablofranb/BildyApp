import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre es requerido'],
      trim: true,
      minlength: [2, 'Mínimo 2 caracteres'],
      maxlength: [100, 'Máximo 100 caracteres']
    },
    email: {
      type: String,
      required: [true, 'El email es requerido'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Email no válido']
    },
    age: {
      type: Number,
      min: [0, 'La edad no puede ser negativa']
    },
    role: {
      type: String,
      enum: {
        values: ['user', 'admin'],
        message: '{VALUE} no es un rol válido'
      },
      default: 'user'
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: [true, 'La empresa es requerida']
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

userSchema.index({ email: 1 });
userSchema.index({ company: 1 });

const User = mongoose.model('User', userSchema);

export default User;