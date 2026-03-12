const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../middleware");
const GalleryService = require("../../services/galleries/gallery.service");
const galleryCategoryService = require("../../services/galleries/galleryCategory.service");

// TAMPILAN LIST
router.get("/", auth.ensureAuth, loadSidebar, loadNotification, async (req, res) => {
  try {
    // const galleries = await GalleryService.getAllGallery();
    const galleryCategory = await galleryCategoryService.getAllGalleryCategory() ?? [];

    res.render("home", {
      link: "galleries/gallery_list",
      jslink: "javascripts/gallery_javascript.js",
      user: req.session.user,
      username: req.session.user?.username || "Guest",
      fullname: req.session.user?.fullname || "Guest",
      ...(galleryCategory ? { galleryCategory } : {})
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
