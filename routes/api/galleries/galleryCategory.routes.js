const express = require("express");
const galleryCategoryController = require("../../../controllers/api/galleries/galleryCategory.controller");
const { injectUser } = require("../../../middleware");

const router = express.Router();

router.get("/", galleryCategoryController.getAllGalleryCategory);
router.get("/datatables", injectUser, galleryCategoryController.getAllGalleryCategoryDatatables);
router.get("/:id", galleryCategoryController.getGalleryCategoryById);
router.post("/", galleryCategoryController.createGalleryCategory);
router.put("/:id", galleryCategoryController.updateGalleryCategory);
router.delete("/:id", galleryCategoryController.deleteGalleryCategory);

module.exports = router;
