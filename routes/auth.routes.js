const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { ensureGuest, ensureAuth } = require("../middleware/auth");
const { ensureAuthToken } = require("../middleware/authJwt");
const { success } = require("../utils/response");

router.get("/api/me", ensureAuthToken, authController.getMe);

// UI route, biarkan frontend yg putuskan redirect jika ada token
router.get("/login", authController.showLoginForm);
// router.post("/register", authController.registerUser);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/changePassword", ensureAuthToken, authController.changePassword);
router.post("/api/login", authController.apiLogin);
// router.post("/api/register", authController.registerUser);

module.exports = router;