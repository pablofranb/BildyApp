import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    projectCode: {
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
    email: {
      type: String,
      trim: true,
      lowercase: true,
      default: null
    },
    notes: {
      type: String,
      trim: true,
      default: null
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
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
    active: {
      type: Boolean,
      default: true
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

projectSchema.index({ projectCode: 1, company: 1 }, { unique: true });
projectSchema.index({ company: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ deleted: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
