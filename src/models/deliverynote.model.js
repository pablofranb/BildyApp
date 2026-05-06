import mongoose from 'mongoose';

const workerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    hours: { type: Number, required: true, min: 0 }
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
    description: { type: String, trim: true, default: null },
    workDate: { type: Date, required: true },
    material: { type: String, trim: true, default: null },
    quantity: { type: Number, min: 0, default: null },
    unit: { type: String, trim: true, default: null },
    hours: { type: Number, min: 0, default: null },
    workers: { type: [workerSchema], default: [] },
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
    pdfUrl: { type: String, default: null },
    deleted: { type: Boolean, default: false }
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
deliveryNoteSchema.index({ deleted: 1 });

const DeliveryNote = mongoose.model('DeliveryNote', deliveryNoteSchema);

export default DeliveryNote;
