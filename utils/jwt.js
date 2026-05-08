'use strict';
require('dotenv').config();
const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "development";

function generateToken(payload) {
  console.log("GENERATE SECRET:", SECRET);
  return jwt.sign(payload, SECRET,{ expiresIn: process.env.JWT_EXPIRES_IN} );
  
}

function verifyToken(token) {
  console.log("VERIFY SECRET:", SECRET);
  return jwt.verify(token, SECRET);
}

module.exports = { generateToken, verifyToken };