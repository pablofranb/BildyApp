import Client from '../models/client.model.js';
import { AppError } from '../utils/AppError.js';
import { getIO } from '../config/socket.js';

// POST /api/client — crea un nuevo cliente asociado al usuario y empresa del token
export const createClient = async (req, res, next) => {
  try {
    // authMiddleware ya puso el usuario en req.user, sacamos su id y su empresa
    const { _id: user, company } = req.user;

    if (!company) {
      return next(AppError.badRequest('El usuario no tiene empresa asociada', 'NO_COMPANY'));
    }

    // guardamos el cliente con los datos del body más el user y company del token
    const client = await Client.create({ ...req.body, user, company });

    getIO().to(company.toString()).emit('client:new', client);

    res.status(201).json({ data: client });
  } catch (error) {
    next(error);
  }
};

// GET /api/client — lista los clientes activos de la empresa con paginación y filtros
export const getClients = async (req, res, next) => {
  try {
    const { company } = req.user;
    const { name, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    // siempre filtramos por company para que cada empresa solo vea sus clientes
    const filter = { company, deleted: false };

    if (name) {
      // $regex permite buscar por texto parcial, $options: 'i' ignora mayúsculas
      filter.name = { $regex: name, $options: 'i' };
    }

    // skip calcula cuántos documentos saltar según la página
    const skip = (Number(page) - 1) * Number(limit);

    // lanzamos las dos consultas en paralelo para no esperar una tras otra
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

// GET /api/client/archived — lista los clientes eliminados con soft delete
export const getArchivedClients = async (req, res, next) => {
  try {
    const { company } = req.user;

    const clients = await Client.find({ company, deleted: true }).sort('-updatedAt');

    res.json({ data: clients });
  } catch (error) {
    next(error);
  }
};

// GET /api/client/:id — obtiene un cliente por id
export const getClient = async (req, res, next) => {
  try {
    const { company } = req.user;

    // buscamos por id Y por company: si el cliente existe pero es de otra empresa, devuelve 404
    const client = await Client.findOne({ _id: req.params.id, company });

    if (!client) {
      return next(AppError.notFound('Cliente no encontrado', 'CLIENT_NOT_FOUND'));
    }

    res.json({ data: client });
  } catch (error) {
    next(error);
  }
};

// PUT /api/client/:id — actualiza los datos de un cliente
export const updateClient = async (req, res, next) => {
  try {
    const { company } = req.user;

    const client = await Client.findOneAndUpdate(
      { _id: req.params.id, company }, // condición: id y misma empresa
      req.body,
      { new: true, runValidators: true } // new: devuelve el doc actualizado, runValidators: aplica validaciones del schema
    );

    if (!client) {
      return next(AppError.notFound('Cliente no encontrado', 'CLIENT_NOT_FOUND'));
    }

    res.json({ data: client });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/client/:id — borra un cliente
// si ?soft=true hace soft delete (marca deleted=true), si no hace hard delete (borra de la BD)
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

// PATCH /api/client/:id/restore — restaura un cliente archivado
export const restoreClient = async (req, res, next) => {
  try {
    const { company } = req.user;

    // solo encuentra el cliente si está archivado (deleted: true)
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
