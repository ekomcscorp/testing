const express = require("express");
const router = express.Router();
const { auth, loadSidebar } = require("../../../middleware");
const MenuRepo = require("../../../repositories/menu.repository");

// TAMPILAN LIST
router.get("/", auth.ensureAuth, auth.restrictToAdmin, loadSidebar, async (req, res) => {
    try {
        const menu = await MenuRepo.findAll();
        const submenu = await MenuRepo.findSubmenu();

        res.render("home", {
            link: "submenu/submenu_list",
            jslink: "javascripts/subMenu_javascript.js",
            user: req.user,
            activeMenu: req.path,
            username: req.user?.username || "Guest",
            fullname: req.user?.fullname || "Guest",
            submenu,
            menu,
            akses: res.locals.akses

        });
    } catch (error) {
        console.error("❌ Error loading users", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;