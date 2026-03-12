const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../middleware");

// TAMPILAN PROFILE
router.get("/", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
    try {
        res.render("home", {
            link: "profile/user_profile", // Path ke file view untuk profile
            jslink: "javascripts/profile_javascript.js", // Path ke file JavaScript khusus profile
            user: req.session.user,
            username: req.session.user?.username || "Guest",
            fullname: req.session.user?.fullname || "Guest",
        });
    } catch (error) {
        console.error("❌ Error loading profile", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;