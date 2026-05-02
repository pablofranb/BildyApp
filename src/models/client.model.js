import mongoose from 'mongoose';

const clientSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    cif: {
      type: String,
      required: true,
      trim: true,
      uppercase: true
    },
    address: {
      street: { type: String, trim: true, default: null },
      number: { type: String, trim: true, default: null },
      postal: { type: String, trim: true, default: null },
      city: { type: String, trim: true, default: null },
      province: { type: String, trim: true, default: null }
    },
    phone: {
      type: String,
      trim: true,
      default: null
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    // usuario que creó el cliente
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // empresa a la que pertenece el cliente
    // todas las consultas filtran por este campo para aislar datos entre empresas
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
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

// índice compuesto: el CIF es único dentro de la misma compañía, no globalmente
clientSchema.index({ cif: 1, company: 1 }, { unique: true });
clientSchema.index({ company: 1 });
clientSchema.index({ deleted: 1 });

const Client = mongoose.model('Client', clientSchema);

export default Client;
