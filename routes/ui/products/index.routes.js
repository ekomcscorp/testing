const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../../middleware");

router.get("/", auth.ensureAuth,  loadSidebar, loadNotification, async (req, res) => {
    try {
        res.render('home', {
            link: "products/product_list",
            jslink: "javascripts/products_javascript.js",
            sidebarMenus: res.locals.sidebarMenus,
            activeMenu: req.path,
            user: req.user,
            username: req.user?.username || "Guest",
            fullname: req.user?.fullname || "Guest",
            akses: res.locals.akses
        })
        console.log("SESSION USER:", req.user);
    } catch (error) {
        console.log("❌ Error loading create product page:", error.message);
        res.status(500).send("Internal Server Error");
    }
})

module.exports = router;