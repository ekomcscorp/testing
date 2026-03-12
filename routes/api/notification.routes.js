const express = require("express");
const router = express.Router();
const userController = require("../../controllers/api/user.controller");

router.get('/unread', userController.getUnreadNotifications);
router.get('/pending', userController.getPendingUserNotifications);

module.exports = router;
