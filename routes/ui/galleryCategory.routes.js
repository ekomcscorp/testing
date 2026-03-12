const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../middleware");
const GallerycategoryService = require("../../services/galleries/galleryCategory.service");
const galleryService = require("../../services/galleries/gallery.service");

// TAMPILAN LIST
router.get("/", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
  try {
    const galleryCategory = await GallerycategoryService.getAllGalleryCategory();

    res.render("home", {
      link: "galleries/galleryCategory_list",
      jslink: "javascripts/galleryCategory_javascript.js",
      user: req.session.user,
      username: req.session.user?.username || "Guest",
      fullname: req.session.user?.fullname || "Guest",
      galleryCategory
    });
  } catch (error) {
    console.error("❌ Error loading gallery:", error.message);
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
