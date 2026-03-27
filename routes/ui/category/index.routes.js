const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../../middleware");
const categoryService = require("../../../services/category.service");
// const galleryService = require("../../../services/galleries/gallery.service");

// TAMPILAN LIST
router.get("/", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
  try {
    const galleryCategory = await categoryService.getAllCategory();

    res.render("home", {
      link: "category/category_list",
      jslink: "javascripts/category_javascript.js",
      user: req.session.user,
      username: req.session.user?.username || "Guest",
      fullname: req.session.user?.fullname || "Guest",
      galleryCategory
    });
  } catch (error) {
    console.error("❌ Error loading category:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// TAMPILAN FORM
router.get("/form", auth.ensureAuth, loadSidebar, async (req, res) => {
  res.render("home", {
    link: "galleries/gallery_form",
    jslink: "javascript/gallery_javascript.js",
    user: req.session.user,
    username: req.session.user?.username || "Guest",
    fullname: req.session.user?.fullname || "Guest",
  });
});


module.exports = router;
