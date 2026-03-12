const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../middleware");
const { link } = require("./transaction.routes");

// TAMPILAN CREATE PRODUCT
router.get("/", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
    try{
        res.render("home", {
            link: "products/create_product",
            jslink: "javascripts/createProduct_javascript.js",
            sideBarMenus: res.locals.sideBarMenus,
            activeMenu: req.path,
            user: req.session.user,
            username: req.session.user?.username || "Guest",
            fullname: req.session.user?.fullname || "Guest",
        });
        console.log('SESSION USER:', req.session.user);
    } catch (error) {
        console.log("❌ Error loading create product page:", error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = router;