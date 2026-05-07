

const { verifyToken } = require("../utils/jwt");

function ensureAuthToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      message: "Token tidak ada"
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = verifyToken(token);

    req.user = decoded; // 🔥 ini pengganti session

    next();
  } catch (err) {
    return res.status(403).json({
      message: "Token tidak valid"
    });
  }
}

module.exports = { ensureAuthToken };