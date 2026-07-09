const express = require("express");
const router = express.Router();
const { auth, loadSidebar,  } = require("../../middleware");

// TAMPILAN PROFILE
router.get("/", auth.ensureAuth, auth.restrictToAdmin, loadSidebar,  async (req, res) => {
    try {
        res.render("home", {
            link: "profile/user_profile", // Path ke file view untuk profile
            jslink: "javascripts/profile_javascript.js", // Path ke file JavaScript khusus profile
            user: req.user,
            username: req.user?.username || "Guest",
            fullname: req.user?.fullname || "Guest",
        });
    } catch (error) {
        console.error("❌ Error loading profile", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;