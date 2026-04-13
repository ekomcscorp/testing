const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../../middleware");
const MenuRepo= require("../../../repositories/menu.repository");

// TAMPILAN LIST
router.get("/", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
    try {
        const menu = await MenuRepo.findAll();
        const submenu = await MenuRepo.findSubmenu();

        res.render("home", {
            link: "submenu/submenu_list",
            jslink: "javascripts/subMenu_javascript.js",
            user: req.session.user,
            activeMenu: req.path,
            username: req.session.user?.username || "Guest",
            fullname: req.session.user?.fullname || "Guest",
            submenu,
            menu
         
        });        
    } catch (error) {
        console.error("❌ Error loading users", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;