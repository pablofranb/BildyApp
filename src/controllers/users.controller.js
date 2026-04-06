import User from '../models/user.model.js';

// GET /api/users
export const getUsers = async (req, res, next) => {
  try {
    const users = await User.find()
      .populate('company', 'name cif address')
      .sort({ createdAt: -1 });

    res.json({ data: users });
  } catch (error) {
    next(error);
  }
};

// GET /api/users/:id
export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('company', 'name cif address');

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuario no encontrado'
      });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// POST /api/users
export const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);
    await user.populate('company', 'name cif address');

    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
};

// PUT /api/users/:id
export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('company', 'name cif address');

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuario no encontrado'
      });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/users/:id
export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({
        error: true,
        message: 'Usuario no encontrado'
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};