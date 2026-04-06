// Importamos el modelo de User.
import User from '../models/user.model.js';


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