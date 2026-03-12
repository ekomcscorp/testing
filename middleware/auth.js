module.exports = {
    ensureAuth: (req, res, next) => {
      if (req.session.user) return next();
      return res.redirect("/login");
    },
    ensureGuest: (req, res, next) => {
      if (!req.session.user) return next();
      return res.redirect("/dashboard");
    }
  };