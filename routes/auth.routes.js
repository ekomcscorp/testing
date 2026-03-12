const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth.controller");
const { ensureGuest, ensureAuth } = require("../middleware/auth");

router.get("/login", ensureGuest, authController.showLoginForm);
router.post("/register", authController.registerUser);
router.post("/login", ensureGuest, authController.login);
router.get("/logout", ensureAuth, authController.logout);

module.exports = router;