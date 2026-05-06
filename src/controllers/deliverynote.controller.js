import DeliveryNote from '../models/deliverynote.model.js';
import Client from '../models/client.model.js';
import Project from '../models/project.model.js';
import { AppError } from '../utils/AppError.js';
import { generateDeliveryNotePdf } from '../services/pdf.service.js';
import { uploadImage, uploadPdf } from '../services/storage.service.js';
import { getIO } from '../config/socket.js';
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
import os from 'os';

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

    getIO().to(company.toString()).emit('deliverynote:new', note);

    res.status(201).json({ data: note });
  } catch (error) {
    next(error);
  }
};

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

    const filter = { company, deleted: false };

    if (project) filter.project = project;
    if (client) filter.client = client;
    if (format) filter.format = format;
    if (signed !== undefined) filter.signed = signed === 'true';

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

export const getDeliveryNote = async (req, res, next) => {
  try {
    const { company } = req.user;

    const note = await DeliveryNote.findOne({ _id: req.params.id, company, deleted: false })
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

export const deleteDeliveryNote = async (req, res, next) => {
  try {
    const { company } = req.user;

    const note = await DeliveryNote.findOne({ _id: req.params.id, company });

    if (!note) {
      return next(AppError.notFound('Albarán no encontrado', 'DELIVERYNOTE_NOT_FOUND'));
    }

    if (note.signed) {
      return next(AppError.badRequest('No se puede eliminar un albarán firmado', 'DELIVERYNOTE_SIGNED'));
    }

    await DeliveryNote.findByIdAndDelete(req.params.id);

    res.json({ message: 'DELIVERYNOTE_DELETED' });
  } catch (error) {
    next(error);
  }
};

export const getDeliveryNotePdf = async (req, res, next) => {
  try {
    const { company } = req.user;

    const note = await DeliveryNote.findOne({ _id: req.params.id, company, deleted: false })
      .populate('client', 'name cif email')
      .populate('project', 'name projectCode')
      .populate('user', 'name email');

    if (!note) {
      return next(AppError.notFound('Albarán no encontrado', 'DELIVERYNOTE_NOT_FOUND'));
    }

    if (note.pdfUrl) {
      return res.redirect(note.pdfUrl);
    }

    const tmpPdf = await generateDeliveryNotePdf(note);

    try {
      const pdfUrl = await uploadPdf(tmpPdf, 'bildyapp/pdfs');
      fs.unlinkSync(tmpPdf);
      note.pdfUrl = pdfUrl;
      await note.save();
      return res.redirect(pdfUrl);
    } catch {
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="albaran-${note._id}.pdf"`);
      const stream = fs.createReadStream(tmpPdf);
      stream.pipe(res);
      stream.on('end', () => fs.unlinkSync(tmpPdf));
    }
  } catch (error) {
    next(error);
  }
};

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

    const tmpSig = path.join(os.tmpdir(), `sig-${note._id}.webp`);
    await sharp(req.file.buffer)
      .resize({ width: 800, withoutEnlargement: true })
      .webp({ quality: 80 })
      .toFile(tmpSig);

    const signatureUrl = await uploadImage(tmpSig, 'bildyapp/signatures');

    note.signed = true;
    note.signedAt = new Date();
    note.signatureUrl = signatureUrl;
    await note.save();

    const populated = await DeliveryNote.findById(note._id)
      .populate('client', 'name cif email')
      .populate('project', 'name projectCode')
      .populate('user', 'name email');

    const tmpPdf = await generateDeliveryNotePdf(populated, tmpSig);
    fs.unlinkSync(tmpSig);

    const pdfUrl = await uploadPdf(tmpPdf, 'bildyapp/pdfs');
    fs.unlinkSync(tmpPdf);

    note.pdfUrl = pdfUrl;
    await note.save();

    getIO().to(note.company.toString()).emit('deliverynote:signed', note);

    res.json({ data: note });
  } catch (error) {
    next(error);
  }
};
