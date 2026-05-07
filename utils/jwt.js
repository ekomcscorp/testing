const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET;

function generateToken(payload) {
  return jwt.sign(payload, SECRET,{ expiresIn: process.env.JWT_EXPIRES_IN} );
}

function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

module.exports = { generateToken, verifyToken };