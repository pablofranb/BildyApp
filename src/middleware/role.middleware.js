const checkRol = (roles) => (req, res, next) => {
  try {
    const { user } = req;
    if (!req.user) {
      return;
    }

    const userRol = user.role;
    const checkValueRol = roles.includes(userRol);

    if (!checkValueRol) {
      return;
    }

    next();
  } catch (err) {
  }
};

export default checkRol;
