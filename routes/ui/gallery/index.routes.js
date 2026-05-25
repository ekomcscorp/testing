const express = require("express");
const router = express.Router();
const { auth, loadSidebar, loadNotification } = require("../../../middleware");
const galleryRepository = require("../../../repositories/gallery.repository");
// const galleryService = require("../../../services/galleries/gallery.service");

// TAMPILAN LIST
router.get("/", auth.ensureAuth, auth.restrictToAdmin, loadSidebar, loadNotification, async (req, res) => {
  try {
    const gallery = await galleryRepository.getAllGalleries();

    res.render("home", {
      link: "gallery/gallery_list",
      jslink: "javascripts/gallery_javascript.js",
      user: req.user,
      username: req.user?.username || "Guest",
      fullname: req.user?.fullname || "Guest",
      gallery
    });
  } catch (error) {
    console.error("❌ Error loading gallery:", error.message);
    res.status(500).send("Internal Server Error");
  }
});

// TAMPILAN FORM
// router.get("/form", auth.ensureAuth, loadSidebar, async (req, res) => {
//   res.render("home", {
//     link: "galleries/gallery_form",
//     jslink: "javascript/gallery_javascript.js",
//     user: req.user,
//     username: req.user?.username || "Guest",
//     fullname: req.user?.fullname || "Guest",
//   });
// });


module.exports = router;
