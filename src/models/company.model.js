import mongoose from 'mongoose';

const companySchema = new mongoose.Schema(
  {
    owner: { 
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    cif: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      unique: true
    },
    address: {
      street: { type: String, trim: true, default: null },
      number: { type: String, trim: true, default: null },
      postal: { type: String, trim: true, default: null },
      city: { type: String, trim: true, default: null },
      province: { type: String, trim: true, default: null }
    },
    logo: {
      type: String,
      default: null
    },
    isFreelance: {
      type: Boolean,
      default: false
    },
    deleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

const Company = mongoose.model('Company', companySchema);

export default Company;