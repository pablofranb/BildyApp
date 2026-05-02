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
    description: {
      type: String,
      trim: true,
      default: null
    },
    // cliente al que pertenece el proyecto
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Client',
      required: true
    },
    // usuario que creó el proyecto
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    // empresa a la que pertenece el proyecto
    // todas las consultas filtran por este campo para aislar datos entre empresas
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

// el código de proyecto es único dentro de la misma compañía, no globalmente
projectSchema.index({ projectCode: 1, company: 1 }, { unique: true });
projectSchema.index({ company: 1 });
projectSchema.index({ client: 1 });
projectSchema.index({ deleted: 1 });

const Project = mongoose.model('Project', projectSchema);

export default Project;
