import Company from '../models/company.model.js';

// GET /api/companies
export const getCompanies = async (req, res, next) => {
  try {
    const companies = await Company.find().sort({ createdAt: -1 });
    res.json({ data: companies });
  } catch (error) {
    next(error);
  }
};

// GET /api/companies/:id
export const getCompany = async (req, res, next) => {
  try {
    const company = await Company.findById(req.params.id);

    if (!company) {
      return res.status(404).json({
        error: true,
        message: 'Empresa no encontrada'
      });
    }

    res.json({ data: company });
  } catch (error) {
    next(error);
  }
};

// POST /api/companies
export const createCompany = async (req, res, next) => {
  try {
    const company = await Company.create(req.body);
    res.status(201).json({ data: company });
  } catch (error) {
    next(error);
  }
};

// PUT /api/companies/:id
export const updateCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({
        error: true,
        message: 'Empresa no encontrada'
      });
    }

    res.json({ data: company });
  } catch (error) {
    next(error);
  }
};

// DELETE /api/companies/:id
export const deleteCompany = async (req, res, next) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);

    if (!company) {
      return res.status(404).json({
        error: true,
        message: 'Empresa no encontrada'
      });
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
};