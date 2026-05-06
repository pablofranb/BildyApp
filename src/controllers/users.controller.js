import User from '../models/user.model.js';
import { encrypt, compare } from '../utils/handlePassword.js';
import { tokenSign, verifyToken } from '../utils/handleJwt.js';
import Company from "../models/company.model.js";
import { changePasswordSchema } from '../validators/user.validator.js';
import { notificationService } from '../services/notification.service.js';
import { sendVerificationEmail } from '../services/email.service.js';

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

export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('company', 'name cif address');

    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const createUser = async (req, res, next) => {
  try {
    const user = await User.create(req.body);

    await user.populate('company', 'name cif address');

    res.status(201).json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('company', 'name cif address');

    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }

    res.json({ data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ error: true, message: 'Usuario no encontrado' });
    }
  } catch (error) {
    next(error);
  }
};

export const registerCtrl = async (req, res) => {
  try {
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

    notificationService.emit('user:registered', { userId: user._id, email: user.email });

    try {
      await sendVerificationEmail(user.email, verificationCode);
    } catch (emailErr) {
      console.error('Email de verificación no enviado:', emailErr.message);
    }

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
      verificationCode: user.verificationCode
    });
  } catch (err) {
    console.log("REGISTER ERROR:", err);
    return res.status(500).json({ error: "ERROR_REGISTER_USER", detail: err.message });
  }
};

export const loginCtrl = async (req, res) => {
  try {
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
    return res.status(500).json({ error: "ERROR_LOGIN_USER", detail: err.message });
  }
};

export const updateMeCtrl = async (req, res, next) => {
  try {
    const { name, lastName, nif } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, lastName, nif },
      { new: true, runValidators: true }
    ).populate('company', 'name cif address');

    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    return res.status(200).json({ message: 'USER_UPDATED', data: user });
  } catch (error) {
    next(error);
  }
};

export const refreshTokenCtrl = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: 'REFRESH_TOKEN_REQUIRED' });
    }

    const decoded = verifyToken(refreshToken);

    if (!decoded) {
      return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN' });
    }

    const user = await User.findById(decoded._id);

    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ error: 'INVALID_REFRESH_TOKEN' });
    }

    const newAccessToken = tokenSign(user);
    return res.status(200).json({ accessToken: newAccessToken });
  } catch (error) {
    return res.status(500).json({ error: 'ERROR_REFRESH_TOKEN' });
  }
};

export const logoutCtrl = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    user.refreshToken = null;
    await user.save();

    return res.status(200).json({ message: 'LOGOUT_OK' });
  } catch (error) {
    return res.status(500).json({ error: 'ERROR_LOGOUT' });
  }
};

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
    const { name, cif, address, isFreelance } = req.body;

    let company = await Company.findOne({ cif });

    if (!company) {
      company = await Company.create({
        name,
        cif,
        address,
        owner: req.user._id,
        isFreelance: !!isFreelance
      });

      await User.findByIdAndUpdate(req.user._id, {
        company: company._id,
        role: 'admin'
      });
    } else {
      await User.findByIdAndUpdate(req.user._id, {
        company: company._id,
        role: 'guest'
      });
    }

    res.status(200).json({ message: 'COMPANY_UPDATED', company });
  } catch (error) {
    next(error);
  }
};

export const validateEmailCtrl = async (req, res) => {
  try {
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

    notificationService.emit('user:verified', { userId: user._id, email: user.email });

    return res.status(200).json({ message: "EMAIL_VERIFIED" });
  } catch (err) {
    return res.status(500).json({ error: "ERROR_VALIDATING_EMAIL" });
  }
};

export const changePasswordCtrl = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id).select("password");

    if (!user) {
      return res.status(404).json({ error: "USER_NOT_FOUND" });
    }

    const check = await compare(currentPassword, user.password);

    if (!check) {
      return res.status(401).json({ error: "INVALID_CURRENT_PASSWORD" });
    }

    user.password = await encrypt(newPassword);
    await user.save();

    return res.status(200).json({ message: "PASSWORD_UPDATED" });
  } catch (err) {
    return res.status(500).json({ error: "ERROR_CHANGING_PASSWORD" });
  }
};

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
      return res.status(200).json({ message: 'USER_SOFT_DELETED' });
    }

    notificationService.emit('user:deleted', {
      userId: user._id,
      email: user.email,
      soft: soft === 'true'
    });

    await User.findByIdAndDelete(req.user._id);

    return res.status(200).json({ message: 'USER_DELETED' });
  } catch (error) {
    return res.status(500).json({ error: 'ERROR_DELETING_USER' });
  }
};

export const uploadLogoCtrl = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ error: 'USER_NOT_FOUND' });
    }

    if (!user.company) {
      return res.status(400).json({ error: 'USER_WITHOUT_COMPANY' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'FILE_REQUIRED' });
    }

    const logoUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const company = await Company.findByIdAndUpdate(
      user.company,
      { logo: logoUrl },
      { new: true }
    );

    return res.status(200).json({ message: 'LOGO_UPDATED', logo: company.logo });
  } catch (error) {
    return res.status(500).json({ error: 'ERROR_UPLOADING_LOGO' });
  }
};
