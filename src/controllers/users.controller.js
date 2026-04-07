// Importamos el modelo de User.
import User from '../models/user.model.js';
import { encrypt, compare } from '../utils/handlePassword.js';
import { tokenSign, verifyToken} from '../utils/handleJwt.js';
import Company from "../models/company.model.js";
import { changePasswordSchema } from '../validators/user.validator.js';
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



// registrar
export const registerCtrl = async (req, res) => {
  try {
    // ya viene validado desde validate(registerSchema)
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: "EMAIL_ALREADY_EXISTS" });
    }

    const hashedPassword = await encrypt(password);
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    const user = await User.create({
      email,
      password: hashedPassword,
      role: "admin",
      status: "pending",
      verificationCode,
      verificationAttempts: 3,
    });

    const accessToken = tokenSign(user);
    const refreshToken = tokenSign(user, "7d");

    user.refreshToken = refreshToken;
    await user.save();

    user.set("password", undefined, { strict: false });

    return res.status(201).json({
      accessToken,
      refreshToken,
      user: {
        email: user.email,
        status: user.status,
        role: user.role,
      },
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    return res.status(500).json({
      error: "ERROR_REGISTER_USER",
      detail: err.message,
    });
  }
};

/**
 * Login de usuario
 * POST /api/user/login
 */
export const loginCtrl = async (req, res) => {
  try {
    // ya viene validado desde validate(loginSchema)
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select(
      "password name lastName role email status refreshToken"
    );

    if (!user) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const check = await compare(password, user.password);

    if (!check) {
      return res.status(401).json({ error: "INVALID_CREDENTIALS" });
    }

    const accessToken = tokenSign(user);
    const refreshToken = tokenSign(user, "7d");

    user.refreshToken = refreshToken;
    await user.save();

    user.set("password", undefined, { strict: false });

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    });
  } catch (err) {
    console.log("LOGIN ERROR:", err);
    return res.status(500).json({
      error: "ERROR_LOGIN_USER",
      detail: err.message,
    });
  }
};

//parte para refresh y logout exigidas
//El frontend manda un refresh token y el backend: comprueba que el token es válidoSi todo está bien → te da un nuevo access token
export const refreshTokenCtrl = async (req, res) => {
  try {
    // cojo el refresh del body
    const { refreshToken } = req.body;

    // Si no viene token error
    if (!refreshToken) {
      return res.status(400).json({ error: 'REFRESH_TOKEN_REQUIRED' });
    }

    // Verifico el token firma y expiración
    const decoded = verifyToken(refreshToken);

    // Si el token no es válido  error
    if (!decoded) {
      return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN' });
    }

    //  Buscamos al usuario en base de datos usando el id del token
    const user = await User.findById(decoded._id);

    // 6Comprobamos dos cosas que el usuario exista yque el refreshToken enviado coincida con el guardado en BD
    // Esto evita usar tokens antiguos o robados
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN' });
    }

    // Generamo un nuevo access token 
    const newAccessToken = tokenSign(user);

    //  Lo devuelvo
    return res.status(200).json({
      accessToken: newAccessToken
    });

  } catch (error) {
    
    return res.status(500).json({ error: 'ERROR_REFRESH_TOKEN' });
  }
};
//logout
export const logoutCtrl = async (req, res) => { try { // Buscamo al usuario usando el id que dejó authMiddleware en req.user 
      const user = await User.findById(req.user._id); 
      //Si no existe el usuario error 
      if (!user) { 
      return res.status(404).json({ error: 'USER_NOT_FOUND' }); }
      // eliminaos el refresh token guardado en base de datos 
      user.refreshToken = null; 
      // guardo el cambio en la base de datos
        await user.save(); 
      //Respondo confirmando el logout
      return res.status(200).json({ message: 'LOGOUT_OK' });
      } catch (error) {
        return res.status(500).json({ error: 'ERROR_LOGOUT' }); } 
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
export const validateEmailCtrl = async (req, res) => {
  try {
    // ya viene validado desde validate(validationCodeSchema)
    const { code } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    if (user.verificationAttempts <= 0) {
      return res.status(429).json({ error: "NO_ATTEMPTS_LEFT" });
    }

    if (user.verificationCode !== code) {
      user.verificationAttempts -= 1;
      await user.save();

      return res.status(400).json({
        error: "INVALID_CODE",
        attemptsLeft: user.verificationAttempts,
      });
    }

    user.status = "verified";
    await user.save();

    return res.status(200).json({
      message: "EMAIL_VERIFIED",
    });
  } catch (err) {
    return res.status(500).json({ error: "ERROR_VALIDATING_EMAIL" });
  }
};

// nueva contraseña
export const changePasswordCtrl = async (req, res) => {
  try {
    // ya viene validado desde validate(changePasswordSchema)
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("password");

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    const check = await compare(currentPassword, user.password);

    if (!check) {
      return res.status(401).json({ error: "INVALID_CURRENT_PASSWORD" });
    }

    const newHashedPassword = await encrypt(newPassword);

    user.password = newHashedPassword;
    await user.save();

    return res.status(200).json({
      message: "PASSWORD_UPDATED",
    });
  } catch (err) {
    return res.status(500).json({ error: "ERROR_CHANGING_PASSWORD" });
  }
};
//borrar
export const deleteMeCtrl = async (req, res) => {
  try {
    const { soft } = req.query;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    if (soft === 'true') {
      user.deleted = true;
      await user.save();

      return res.status(200).json({
        message: 'USER_SOFT_DELETED'
      });
    }

    await User.findByIdAndDelete(req.user._id);

    return res.status(200).json({
      message: 'USER_DELETED'
    });
  } catch (error) {
    return res.status(500).json({ error: 'ERROR_DELETING_USER' });
  }
};