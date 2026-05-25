const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../../middleware");
const UserRepo = require("../../../repositories/user.repository");
const UserlevelRepo = require("../../../repositories/userlevel.repository");

// TAMPILAN LIST
router.get("/", auth.ensureAuth, auth.restrictToAdmin, loadSidebar, loadNotification, async (req, res) => {
    try {
        const users = await UserRepo.getAllUsers();
        const userlevels = await UserlevelRepo.getAllUserlevels();

        res.render("home", {
            link: "users/user_list",
            jslink: "javascripts/user_javascript.js",
            activeMenu: req.path,
            user: req.user,
            username: req.user?.username || "Guest",
            fullname: req.user?.fullname || "Guest",
            users,
            userlevels
        });
    } catch (error) {
        console.error("❌ Error loading users", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;