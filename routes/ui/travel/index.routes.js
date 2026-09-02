const express = require('express');
const router = express.Router();
const { auth, loadSidebar } = require("../../../middleware");
const UserRepo = require("../../../repositories/user.repository");
const UserLevelRepo = require("../../../repositories/userlevel.repository");

router.get("/", auth.ensureAuth, auth.restrictToAdmin, loadSidebar, async (req, res) => {
    try {
        const users = await UserRepo.getAllTravels();
        const userlevels = await UserLevelRepo.getAllUserlevels();


        res.render("home", {
            link: "travel/travel_list",
            jslink: "javascripts/travel_javascript.js",
            activeMenu: req.path,
            user: req.user,
            username: req.user?.username || "Guest",
            fullname: req.user?.fullname || "Guest",
            users,
            userlevels
        });
    } catch (error) {
        console.error("❌ Error loading travel", error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;