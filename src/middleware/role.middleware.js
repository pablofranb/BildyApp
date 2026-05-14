const checkRol = (roles) => (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    const checkValueRol = roles.includes(req.user.role);

    if (!checkValueRol) {
      return res.status(403).json({ error: 'FORBIDDEN' });
    }

    next();
  } catch (err) {
    return res.status(403).json({ error: 'FORBIDDEN' });
  }
};

export default checkRol;
