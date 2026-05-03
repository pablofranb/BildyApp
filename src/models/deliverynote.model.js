import mongoose from 'mongoose';

const itemSchema = new mongoose.Schema(
  {
    material: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 0 },
    unit: { type: String, required: true, trim: true }
  },
  { _id: false }
);

const deliveryNoteSchema = new mongoose.Schema(
  {
    format: {
      type: String,
      enum: ['material', 'hours'],
      required: true
    },
    // campos para format: 'material'
    items: [itemSchema],
    // campos para format: 'hours'
    hours: { type: Number, min: 0, default: null },
    workers: { type: Number, min: 1, default: null },

    workDate: { type: Date, required: true },

    // referencias — todas las consultas filtran por company para aislar datos entre empresas
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
      required: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Company',
      required: true
    },

    signed: { type: Boolean, default: false },
    signedAt: { type: Date, default: null },
    signatureUrl: { type: String, default: null },
    pdfUrl: { type: String, default: null }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

deliveryNoteSchema.index({ company: 1 });
deliveryNoteSchema.index({ client: 1 });
deliveryNoteSchema.index({ project: 1 });
deliveryNoteSchema.index({ signed: 1 });

const DeliveryNote = mongoose.model('DeliveryNote', deliveryNoteSchema);

export default DeliveryNote;
