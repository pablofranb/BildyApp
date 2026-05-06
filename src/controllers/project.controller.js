import Project from '../models/project.model.js';
import Client from '../models/client.model.js';
import { AppError } from '../utils/AppError.js';
import { getIO } from '../config/socket.js';

// POST /api/project — crea un nuevo proyecto asociado al usuario y empresa del token
export const createProject = async (req, res, next) => {
  try {
    const { _id: user, company } = req.user;

    if (!company) {
      return next(AppError.badRequest('El usuario no tiene empresa asociada', 'NO_COMPANY'));
    }

    // verificamos que el cliente existe y pertenece a la misma empresa
    const client = await Client.findOne({ _id: req.body.client, company, deleted: false });
    if (!client) {
      return next(AppError.notFound('Cliente no encontrado', 'CLIENT_NOT_FOUND'));
    }

    const project = await Project.create({ ...req.body, user, company });

    getIO().to(company.toString()).emit('project:new', project);

    res.status(201).json({ data: project });
  } catch (error) {
    next(error);
  }
};

// GET /api/project — lista los proyectos activos de la empresa con paginación y filtros
export const getProjects = async (req, res, next) => {
  try {
    const { company } = req.user;
    const { name, client, active, sort = '-createdAt', page = 1, limit = 10 } = req.query;

    const filter = { company, deleted: false };

    if (name) filter.name = { $regex: name, $options: 'i' };
    if (client) filter.client = client;
    // active puede llegar como string 'true'/'false' desde la query
    if (active !== undefined) filter.active = active === 'true';

    const skip = (Number(page) - 1) * Number(limit);

    const [projects, totalItems] = await Promise.all([
      Project.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      Project.countDocuments(filter)
    ]);

    res.json({
      data: projects,
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

// GET /api/project/archived — lista los proyectos eliminados con soft delete
export const getArchivedProjects = async (req, res, next) => {
  try {
    const { company } = req.user;

    const projects = await Project.find({ company, deleted: true }).sort('-updatedAt');

    res.json({ data: projects });
  } catch (error) {
    next(error);
  }
};

// GET /api/project/:id — obtiene un proyecto por id
export const getProject = async (req, res, next) => {
  try {
    const { company } = req.user;

    // buscamos por id Y por company: si el proyecto existe pero es de otra empresa, devuelve 404
    const project = await Project.findOne({ _id: req.params.id, company });

    if (!project) {
      return next(AppError.notFound('Proyecto no encontrado', 'PROJECT_NOT_FOUND'));
    }

    res.json({ data: project });
  } catch (error) {
    next(error);
  }
};

// PUT /api/project/:id — actualiza los datos de un proyecto
export const updateProject = async (req, res, next) => {
  try {
    const { company } = req.user;

    // si se cambia el cliente, verificamos que el nuevo cliente pertenece a la misma empresa
    if (req.body.client) {
      const client = await Client.findOne({ _id: req.body.client, company, deleted: false });
      if (!client) {
        return next(AppError.notFound('Cliente no encontrado', 'CLIENT_NOT_FOUND'));
      }
    }

    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company },
      req.body,
      { new: true, runValidators: true }
    );

    if (!project) {
      return next(AppError.notFound('Proyecto no encontrado', 'PROJECT_NOT_FOUND'));
    }

    res.json({ data: project });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/project/:id — borra un proyecto
// si ?soft=true hace soft delete (marca deleted=true), si no hace hard delete
export const deleteProject = async (req, res, next) => {
  try {
    const { company } = req.user;
    const { soft } = req.query;

    const project = await Project.findOne({ _id: req.params.id, company });

    if (!project) {
      return next(AppError.notFound('Proyecto no encontrado', 'PROJECT_NOT_FOUND'));
    }

    if (soft === 'true') {
      project.deleted = true;
      await project.save();
      return res.json({ message: 'PROJECT_ARCHIVED' });
    }

    await Project.findByIdAndDelete(req.params.id);
    res.json({ message: 'PROJECT_DELETED' });
  } catch (error) {
    next(error);
  }
};

// PATCH /api/project/:id/restore — restaura un proyecto archivado
export const restoreProject = async (req, res, next) => {
  try {
    const { company } = req.user;

    // solo encuentra el proyecto si está archivado (deleted: true)
    const project = await Project.findOneAndUpdate(
      { _id: req.params.id, company, deleted: true },
      { deleted: false },
      { new: true }
    );

    if (!project) {
      return next(AppError.notFound('Proyecto no encontrado o no está archivado', 'PROJECT_NOT_FOUND'));
    }

    res.json({ data: project });
  } catch (error) {
    next(error);
  }
};
