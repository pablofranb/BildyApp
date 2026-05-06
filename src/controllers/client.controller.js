import Client from '../models/client.model.js';
import { AppError } from '../utils/AppError.js';
import { getIO } from '../config/socket.js';

export const createClient = async (req, res, next) => {
  try {
    const { _id: user, company } = req.user;

    if (!company) {
      return next(AppError.badRequest('El usuario no tiene empresa asociada', 'NO_COMPANY'));
    }

    const client = await Client.create({ ...req.body, user, company });

    getIO().to(company.toString()).emit('client:new', client);

    res.status(201).json({ data: client });
  } catch (error) {
    next(error);
  }
};

export const getClients = async (req, res, next) => {
  try {
    const { company } = req.user;
    const { name, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    const filter = { company, deleted: false };

    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [clients, totalItems] = await Promise.all([
      Client.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Client.countDocuments(filter)
    ]);

    res.json({
      data: clients,
      pagination: {
        totalItems,
        totalPages: Math.ceil(totalItems / Number(limit)),
        currentPage: Number(page),
        limit: Number(limit)
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getArchivedClients = async (req, res, next) => {
  try {
    const { company } = req.user;

    const clients = await Client.find({ company, deleted: true }).sort('-updatedAt');

    res.json({ data: clients });
  } catch (error) {
    next(error);
  }
};

export const getClient = async (req, res, next) => {
  try {
    const { company } = req.user;

    const client = await Client.findOne({ _id: req.params.id, company });

    if (!client) {
      return next(AppError.notFound('Cliente no encontrado', 'CLIENT_NOT_FOUND'));
    }

    res.json({ data: client });
  } catch (error) {
    next(error);
  }
};

export const updateClient = async (req, res, next) => {
  try {
    const { company } = req.user;

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, company },
      req.body,
      { new: true, runValidators: true }
    );

    if (!client) {
      return next(AppError.notFound('Cliente no encontrado', 'CLIENT_NOT_FOUND'));
    }

    res.json({ data: client });
  } catch (error) {
    next(error);
  }
};

export const deleteClient = async (req, res, next) => {
  try {
    const { company } = req.user;
    const { soft } = req.query;

    const client = await Client.findOne({ _id: req.params.id, company });

    if (!client) {
      return next(AppError.notFound('Cliente no encontrado', 'CLIENT_NOT_FOUND'));
    }

    if (soft === 'true') {
      client.deleted = true;
      await client.save();
      return res.json({ message: 'CLIENT_ARCHIVED' });
    }

    await Client.findByIdAndDelete(req.params.id);
    res.json({ message: 'CLIENT_DELETED' });
  } catch (error) {
    next(error);
  }
};

export const restoreClient = async (req, res, next) => {
  try {
    const { company } = req.user;

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, company, deleted: true },
      { deleted: false },
      { new: true }
    );

    if (!client) {
      return next(AppError.notFound('Cliente no encontrado o no está archivado', 'CLIENT_NOT_FOUND'));
    }

    res.json({ data: client });
  } catch (error) {
    next(error);
  }
};
