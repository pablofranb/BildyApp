// Importamos el modelo de User.
import User from '../models/user.model.js';
import { encrypt, compare } from '../utils/handlePassword.js';
import { tokenSign, verifyToken} from '../utils/handleJwt.js';
import { loginSchema, registerSchema } from "../validators/user.validator.js";
import Company from "../models/company.model.js";
// GET /api/users, para obtener todos los usuarios.
export const getUsers = async (req, res, next) => {
  try {
    // User.find() busca todos los documentos de la colección users.
    const users = await User.find()

      // populate sustituye el ObjectId de company por datos reales ce la empresa relacionada.
      .populate('company', 'name cif address')

      // ordenos egun cuando fueron creadas
      .sort({ createdAt: -1 });
  //envía una respuesta en formato JSON.
    res.json({ data: users });

  } catch (error) {
    // paso el error al midelware de rrores.
    next(error);
  }
};


// GET /api/users/:id
// Controller para obtener un usuario  por su id.
export const getUser = async (req, res, next) => {
  try {
    // req.params contiene los parámetros de la URL.
    const user = await User.findById(req.params.id)
    // populate hace lo mismo: reemplaza company por sus datos.
      .populate('company', 'name cif address');
    // Si no existe el usuario, devolvemos error 404.
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuario no encontrado'
      });
    }
  // Si existe o devuelvo como json.
    res.json({ data: user });

  } catch (error) {
    next(error);
  }
};


// POST /api/users
// Controller para crear un usuario nuevo.
export const createUser = async (req, res, next) => {
  try {
    // req.body contiene los datos enviados en la petición.
    const user = await User.create(req.body);

    // voy a por los datos de la empresa pero pongo el await porque no es instantaneo, sino podria devolver ese 201 antes de q acabe
    await user.populate('company', 'name cif address');

    // 201 de q ha funcionado 
    res.status(201).json({ data: user });

  } catch (error) {
    next(error);
  }
};


// PUT /api/users/:id
// Controller para actualizar un usuario existente.
export const updateUser = async (req, res, next) => {
  try {
    //funcion de mongo
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        // new true => devuelve el documento ya actualizado,
        new: true,
        // runValidatorsobliga a validar los datos con las reglas del schema al actualizar.
        runValidators: true
      }
    )
    // para incluir datos de la empresa
    .populate('company', 'name cif address');
    // Si no existe ese usuario 404.
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuario no encontrado'
      });
    }
    // Si existe, devolvemos el usuario actualizado.
    res.json({ data: user });

  } catch (error) {
    next(error);
  }
};


// DELETE /api/users/:id
// Controller para borrar un usuario por id.
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    // Si no existe 404.
    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuario no encontrado'
      });
    }
  } catch (error) {
    next(error);
  }
};



//registrar
export const registerCtrl = async (req, res) => {
  try {
     // validar con zod
    const validatedData = registerSchema.parse(req.body);
    const { email, password } = validatedData;

     // comprobar campos obligatorios
    if (!email || !password) {
      return res.status(400).json({
        error: "EMAIL_AND_PASSWORD_REQUIRED",
      });
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      //esto ya lo añadire handleHttpError(res, 'EMAIL_ALREADY_EXISTS', 409);
        return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }
    // Encriptar contraseña
    const hashedPassword = await encrypt(password);
    // generar código de verificación de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    /// crear usuario
   const user = await User.create({
  email,
  password: hashedPassword,
  role: "admin",
  status: "pending",
  verificationCode,
  verificationAttempts: 3,
});

    // Ocultar password en la respuesta
    user.set("password", undefined, { strict: false });
    
     // generar tokens
    const data = {
      accessToken: tokenSign(user),
      refreshToken: tokenSign(user, '7d'),
      user: {
        email: user.email,
        status: user.status,
        role: user.role
      }
    };
    
    res.status(201).send(data);
  } catch (err) {
    console.log(err);
    //handleHttpError(res, 'ERROR_REGISTER_USER');
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: "VALIDATION_ERROR",
        details: err.errors,
      });
    }
  }
};

/**
 * Login de usuario
 * POST /api/user/login
 */
export const loginCtrl = async (req, res) => {
  try {
    // validar con zod
    const { email, password } = loginSchema.parse(req.body);

    // Buscar usuario con la password
    const user = await User.findOne({ email }).select(
      "password name lastName role email status"
    );

    if (!user) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    // Comparo la contraseña con el hash a ver si es la original
    const check = await compare(password, user.password);

    if (!check) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    user.set("password", undefined, { strict: false });

    // devolver tokens
    const data = {
      accessToken: tokenSign(user),
      refreshToken: tokenSign(user, "7d"),
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };

    res.status(200).json(data);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: "VALIDATION_ERROR" });
    }

    res.status(500).json({ error: "ERROR_LOGIN_USER" });
  }
};
//prueba 
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("company", "name cif address");

    res.status(200).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const updateCompanyCtrl = async (req, res, next) => {
  try {
    //Sacao los datos que llegan del body
    const { name, cif, address, isFreelance } = req.body;

    // Busco si ya existe una company con ese CIF
    let company = await Company.findOne({ cif });
    //sinoexiste la creamos nueva
    if (!company) {
      company = await Company.create({
        name,
        cif,
        address,
        owner: req.user._id,      // el usuario autenticado será el owner
        isFreelance: !!isFreelance
      });

      // Al crear una company nueva, el usuario sigue siendo admin
      await User.findByIdAndUpdate(req.user._id, {
        company: company._id,
        role: 'admin'
      });

    } else {
      // Si YA existe una company con ese CIF,
      // el usuario se une a esa company y pasa a guest
      await User.findByIdAndUpdate(req.user._id, {
        company: company._id,
        role: 'guest'
      });
    }

    // Devolvemos respuesta correcta
    res.status(200).json({
      message: 'COMPANY_UPDATED',
      company
    });

  } catch (error) {
    next(error);
  }
};