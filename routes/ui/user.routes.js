const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../middleware");
const UserService = require("../../services/user.service");
const userlevelService = require("../../services/userlevel.service");

// TAMPILAN LIST
router.get("/", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
    try {
        const users = await UserService.getAllUsers();
        const userlevels = await userlevelService.getAllUserlevel();

        res.render("home", {
            link: "users/user_list",
            jslink: "javascripts/user_javascript.js",
            user: req.session.user,
            username: req.session.user?.username || "Guest",
            fullname: req.session.user?.fullname || "Guest",
            users,
            userlevels
        });
    } catch (error) {
        console.error("❌ Error loading users", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;