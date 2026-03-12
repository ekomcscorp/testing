const express = require("express");
const galleryController = require("../../../controllers/api/galleries/gallery.controller");
const { injectUser } = require("../../../middleware");

const router = express.Router();

router.get("/", galleryController.getAllGallery);
router.get("/by-category", galleryController.getGalleryByCategory);
router.get("/datatables", injectUser, galleryController.getAllGalleryDatatables);
router.get("/:id", galleryController.getGalleryById);
router.post("/", galleryController.createGallery);
router.put("/:id", galleryController.updateGallery);
router.delete("/:id", galleryController.deleteGallery);

module.exports = router;
