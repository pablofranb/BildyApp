import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'El nombre de la empresa es requerido'],
      trim: true,
      minlength: [2, 'Mínimo 2 caracteres'],
      maxlength: [100, 'Máximo 100 caracteres']
    },
    cif: {
      type: String,
      required: [true, 'El CIF es requerido'],
      unique: true,
      trim: true,
      uppercase: true
    },
    address: {
      type: String,
      required: [true, 'La dirección es requerida'],
      trim: true
    },
    sector: {
      type: String,
      trim: true,
      default: null
    },
    website: {
      type: String,
      trim: true,
      default: null
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Company = mongoose.model('Company', companySchema);

export default Company;