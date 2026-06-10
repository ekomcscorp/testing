const express = require("express");
const router = express.Router();
const { ensureAuth, restrictToAdmin } = require("../../../middleware/auth");
const loadSidebar = require("../../../middleware/loadSidebar"); // ✅
const loadNotification = require("../../../middleware/loadNotification"); // ✅

router.get("/", ensureAuth,  loadSidebar, restrictToAdmin, loadNotification, (req, res) => {
  res.render("home", {
    link: "index", // nama partial konten
    jslink: "javascripts/javascript.js", // load JS eksternal
    sidebarMenus: res.locals.sidebarMenus || [],
    activeMenu: res.locals.activeMenu || "",
    // EJS tidak tahu usernya karena token ada di localStorage.
    // Client script (checkAuth) yang akan nge-set profile.
    user: req.user,
    username: req.user?.username || "Guest",
    fullname: req.user?.fullname || "Guest"
  });
});


module.exports = router;
