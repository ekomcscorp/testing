const express = require("express");
const router = express.Router();
const { auth, loadSidebar } = require("../../../middleware");
const { link } = require("../transactions/index.routes");

// TAMPILAN CREATE PRODUCT
router.get("/", auth.ensureAuth, loadSidebar, async (req, res) => {
    try {
        res.render("home", {
            link: "products/create_product",
            jslink: "javascripts/createProduct_javascript.js",
            sideBarMenus: res.locals.sideBarMenus,
            activeMenu: req.path,
            user: req.user,
            username: req.user?.username || "Guest",
            fullname: req.user?.fullname || "Guest",
        });
        console.log('SESSION USER:', req.user);
    } catch (error) {
        console.log("❌ Error loading create product page:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;