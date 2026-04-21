const express = require("express");
const GalleryController = require("../../../controllers/api/gallery.controller");
const { injectUser } = require("../../../middleware");

const multer = require('multer'); // ✅ TAMBAHIN

const crypto = require('crypto');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/assets/img/gallery/');
  },
  filename: function (req, file, cb) {
    const ext = file.originalname.split('.').pop(); // ambil ekstensi
    const hash = crypto.randomBytes(16).toString('hex'); // 🔥 generate hash
    cb(null, `${hash}.${ext}`);
  }
});

const upload = multer({ storage: storage }); // ✅ TAMBAHIN

const router = express.Router();

router.get("/", GalleryController.getAllGallery);
router.get("/datatables", injectUser, GalleryController.getAllGalleryDatatables);
router.get("/:id", GalleryController.getGalleryById);

// 🔥 INI YANG PENTING
router.post("/", upload.single('image'), GalleryController.createGallery);

router.put('/:id', upload.single('image'), GalleryController.updateGallery);
router.delete("/:id", GalleryController.deleteGallery);

module.exports = router;