module.exports = {
  ensureAuth: (req, res, next) => {
    if (req.user) return next();
    return res.redirect("/login");
  },
  ensureGuest: (req, res, next) => {
    if (!req.user) return next();
    return res.redirect("/dashboard");
  },
  restrictToAdmin: (req, res, next) => {
    if (req.user && (req.user.id_level === 1 || req.user.id_level === 2)) {
      return next();   
    }
    // Jika bukan level 1 atau 2, buang ke landing page luar
    return res.redirect("https://gold-lark-507177.hostingersite.com/");
  }
};