// Importamos el modelo de User.
import User from '../models/user.model.js';
import { encrypt, compare } from '../utils/handlePassword.js';
import { tokenSign, verifyToken} from '../utils/handleJwt.js';

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
    const { email, password } = req.body;

    // comprobar campos obligatorios
    if (!email || !password) {
      //handleHttpError(res, 'EMAIL_AND_PASSWORD_REQUIRED', 400);
      return;
    }

    // Verificar si el email ya existe
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      //esto ya lo añadire handleHttpError(res, 'EMAIL_ALREADY_EXISTS', 409);
      return;
    }
    // Encriptar contraseña
    const hashedPassword = await encrypt(req.body.password);
    // generar código de verificación de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString()
    
    /// crear usuario
    const user = await User.create({
      ...req.body,
      email: email.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      status: 'pending',
      verificationCode,
      verificationAttempts: 3
    });

    // Ocultar password en la respuesta
    dataUser.set('password', undefined, { strict: false });
    
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
  }
};

/**
 * Login de usuario
 * POST /api/user/login
 */
export const loginCtrl = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Buscar usuario con la password
    const user = await User.findOne({ email }).select('password name role email');
    
    if (!user) {
      //handleHttpError(res, 'USER_NOT_EXISTS', 404);
      return;
    }
    
    // Comparo la contraseña con el hash a ver si es la original
    const hashPassword = user.password;
    const check = await compare(password, hashPassword);
    
    if (!check) {
      //handleHttpError(res, 'INVALID_PASSWORD', 401);
      return;
    }
    
    // cuando devuelvo el usuario no quiero que salga el password, aunque lo tenga en la base de datos, por eso lo pongo a undefined, y con strict false le digo que no me lo quite del todo, porque si no me lo quita y no puedo generar el token con los datos del usuario
    user.set('password', undefined, { strict: false });
    
     // devolver tokens
    const data = {
      accessToken: tokenSign(user),  //le doy un token de acceso
      refreshToken: tokenSign(user, '7d'),//token q se refresca cuando elcess caduca para q el ususario durante 7 dias no tega q hacer sesion
      user: { //datos del ususario
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        status: user.status
      }
    };
    
     res.status(200).send(data);
  } catch (err) {
    console.log(err);
    //handleHttpError(res, 'ERROR_LOGIN_USER', 500);
  }
};