// middleware/loadNotification.js
const { UserNotification, User } = require("../models"); // atau import sesuai struktur kamu

module.exports = async function loadNotification(req, res, next) {
  try {
    const user = req.session.user;

    // Jika bukan admin, skip
    if (!user || user.id_level !== 1) {
      res.locals.pendingNotifs = [];
      return next();
    }

    const pendingNotifs = await UserNotification.findAll({
      where: { isRead: false },
      include: [{ model: User, attributes: ['fullname', 'username'] }],
      order: [['createdAt', 'DESC']],
      limit: 5
    });

    res.locals.pendingNotifs = pendingNotifs;
    next();
  } catch (err) {
    console.error("❌ Gagal memuat notifikasi:", err.message);
    res.locals.pendingNotifs = [];
    next();
  }
};
