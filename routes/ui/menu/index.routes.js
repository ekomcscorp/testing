const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../../middleware");
const MenuRepo = require("../../../repositories/menu.repository");

// TAMPILAN LIST
router.get("/", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
    try {
        const menu = await MenuRepo.findAll();
        
        res.render("home", {
            link: "menu/menu_list",
            jslink: "javascripts/menu_javascript.js",
            sidebarMenus: res.locals.sidebarMenus,
            activeMenu: req.path,
            user: req.session.user,
            username: req.session.user?.username || "Guest",
            fullname: req.session.user?.fullname || "Guest",
        });  
        console.log('SESSION USER:', req.session.user);

    } catch (error) {
        console.log("❌ Error loading gallery:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;