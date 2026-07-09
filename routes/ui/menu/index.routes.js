const express = require("express");
const router = express.Router();
const { auth, loadSidebar } = require("../../../middleware");
const MenuRepo = require("../../../repositories/menu.repository");

// TAMPILAN LIST
router.get("/", auth.ensureAuth, auth.restrictToAdmin, loadSidebar, async (req, res) => {
    try {
        const menu = await MenuRepo.findAll();

        // Debug: tampilkan akses yang tersedia untuk view
        console.log('DEBUG res.locals.akses for /menu =>', res.locals.akses);

        res.render("home", {
            link: "menu/menu_list",
            jslink: "javascripts/menu_javascript.js",
            sidebarMenus: res.locals.sidebarMenus,
            activeMenu: req.path,
            user: req.user,
            username: req.user?.username || "Guest",
            fullname: req.user?.fullname || "Guest",
            akses: res.locals.akses // pastikan akses tersedia di view scope
        });
        console.log('SESSION USER:', req.user);

    } catch (error) {
        console.log("❌ Error loading gallery:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;