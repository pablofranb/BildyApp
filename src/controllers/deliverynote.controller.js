import DeliveryNote from '../models/deliverynote.model.js';
import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import { AppError } from '../utils/AppError.js';
import { generateDeliveryNotePdf } from '../services/pdf.service.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

// POST /api/deliverynote — crea un albarán verificando que cliente y proyecto son de la misma empresa
export const createDeliveryNote = async (req, res, next) => {
  try {
    const { _id: user, company } = req.user;

    if (!company) {
      return next(AppError.badRequest('El usuario no tiene empresa asociada', 'NO_COMPANY'));
    }

    const client = await Client.findOne({ _id: req.body.client, company, deleted: false });
    if (!client) {
      return next(AppError.notFound('Cliente no encontrado', 'CLIENT_NOT_FOUND'));
    }

    const project = await Project.findOne({ _id: req.body.project, company, deleted: false });
    if (!project) {
      return next(AppError.notFound('Proyecto no encontrado', 'PROJECT_NOT_FOUND'));
    }

    const note = await DeliveryNote.create({ ...req.body, user, company });

    res.status(201).json({ data: note });
  } catch (error) {
    next(error);
  }
};

// GET /api/deliverynote — lista albaranes con filtros y paginación
export const getDeliveryNotes = async (req, res, next) => {
  try {
    const { company } = req.user;
    const {
      project,
      client,
      format,
      signed,
      from,
      to,
      sort = '-createdAt',
      page = 1,
      limit = 10
    } = req.query;

    // siempre filtramos por company para aislar datos entre empresas
    const filter = { company };

    if (project) filter.project = project;
    if (client) filter.client = client;
    if (format) filter.format = format;
    if (signed !== undefined) filter.signed = signed === 'true';

    // rango de fechas sobre workDate
    if (from || to) {
      filter.workDate = {};
      if (from) filter.workDate.$gte = new Date(from);
      if (to) filter.workDate.$lte = new Date(to);
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [notes, totalItems] = await Promise.all([
      DeliveryNote.find(filter).sort(sort).skip(skip).limit(Number(limit)),
      DeliveryNote.countDocuments(filter)
    ]);

    res.json({
      data: notes,
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

// GET /api/deliverynote/:id — obtiene un albarán con todos sus datos relacionados (populate)
export const getDeliveryNote = async (req, res, next) => {
  try {
    const { company } = req.user;

    const note = await DeliveryNote.findOne({ _id: req.params.id, company })
      .populate('client', 'name cif email')
      .populate('project', 'name projectCode')
      .populate('user', 'name email');

    if (!note) {
      return next(AppError.notFound('Albarán no encontrado', 'DELIVERYNOTE_NOT_FOUND'));
    }

    res.json({ data: note });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/deliverynote/:id — borra un albarán solo si no está firmado
export const deleteDeliveryNote = async (req, res, next) => {
  try {
    const { company } = req.user;

    const note = await DeliveryNote.findOne({ _id: req.params.id, company });

    if (!note) {
      return next(AppError.notFound('Albarán no encontrado', 'DELIVERYNOTE_NOT_FOUND'));
    }

    // un albarán firmado es un documento legal — no se puede borrar
    if (note.signed) {
      return next(AppError.badRequest('No se puede eliminar un albarán firmado', 'DELIVERYNOTE_SIGNED'));
    }

    await DeliveryNote.findByIdAndDelete(req.params.id);

    res.json({ message: 'DELIVERYNOTE_DELETED' });
  } catch (error) {
    next(error);
  }
};

// GET /api/deliverynote/pdf/:id — genera y devuelve el PDF del albarán
export const getDeliveryNotePdf = async (req, res, next) => {
  try {
    const { company } = req.user;

    const note = await DeliveryNote.findOne({ _id: req.params.id, company })
      .populate('client', 'name cif email')
      .populate('project', 'name projectCode')
      .populate('user', 'name email');

    if (!note) {
      return next(AppError.notFound('Albarán no encontrado', 'DELIVERYNOTE_NOT_FOUND'));
    }

    const relativePath = await generateDeliveryNotePdf(note);
    const absolutePath = path.resolve(relativePath);

    // guardar la ruta del PDF en el documento si no estaba guardada
    if (!note.pdfUrl) {
      note.pdfUrl = `/${relativePath}`;
      await note.save();
    }

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="albaran-${note._id}.pdf"`);
    fs.createReadStream(absolutePath).pipe(res);
  } catch (error) {
    next(error);
  }
};

// PATCH /api/deliverynote/:id/sign — sube la firma y marca el albarán como firmado
export const signDeliveryNote = async (req, res, next) => {
  try {
    const { company } = req.user;

    const note = await DeliveryNote.findOne({ _id: req.params.id, company });

    if (!note) {
      return next(AppError.notFound('Albarán no encontrado', 'DELIVERYNOTE_NOT_FOUND'));
    }

    if (note.signed) {
      return next(AppError.badRequest('El albarán ya está firmado', 'DELIVERYNOTE_ALREADY_SIGNED'));
    }

    if (!req.file) {
      return next(AppError.badRequest('Se requiere imagen de firma', 'SIGNATURE_REQUIRED'));
    }

    // procesar la imagen con Sharp: normalizar a PNG 400x200 máximo
    const outputPath = path.join('uploads/signatures', `sig-${note._id}.png`);
    await sharp(req.file.path)
      .resize({ width: 400, height: 200, fit: 'inside' })
      .png()
      .toFile(outputPath);

    // eliminar el temporal subido por multer
    fs.unlinkSync(req.file.path);

    note.signed = true;
    note.signedAt = new Date();
    note.signatureUrl = `/${outputPath}`;

    await note.save();

    // regenerar PDF con la firma incluida
    const populated = await DeliveryNote.findById(note._id)
      .populate('client', 'name cif email')
      .populate('project', 'name projectCode')
      .populate('user', 'name email');

    const relativePath = await generateDeliveryNotePdf(populated);
    note.pdfUrl = `/${relativePath}`;
    await note.save();

    res.json({ data: note });
  } catch (error) {
    next(error);
  }
};
