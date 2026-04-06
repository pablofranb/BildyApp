import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {//campos
    email: {
      type: String,
      required: true,
      trim: true, //elimino los espacios 
      lowercase: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      trim: true,
      default: null //sino mando nada me lo ponen null
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
      enum: ['admin', 'guest'], //mis opciones
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
      type: mongoose.Schema.Types.ObjectId, //voy a guardar el id de una empresa para relacionarlos no el objeto entero
      ref: 'Company',//del modelo company
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
    }
  },
  //mis reglas de manejo
  {
    timestamps: true, //para que salga cuando lo añado o actualizo
    versionKey: false, //quito el campo _v de versiones
    toJSON: { virtuals: true }, //cuando pase a json añada  las virtuals 
    toObject: { virtuals: true }//igual pero al convertir a objeto
  }
);

//no se guarda en la base de datos pero me lo calcula al vuelo con el nombre y apellido para tener el nombre completo, me lo piden en la practcia
userSchema.virtual('fullName').get(function () {
  return `${this.name || ''} ${this.lastName || ''}`.trim();
}); 

//indices para  las consultas por email, company, status y role
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ company: 1 });
userSchema.index({ status: 1 });
userSchema.index({ role: 1 });

//convierto el esquema a modelo( como decir mi clase)
const User = mongoose.model('User', userSchema);

export default User;