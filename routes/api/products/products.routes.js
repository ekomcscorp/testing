const express = require("express");
const { injectUser } = require ('../../../middleware/index.js');
const productController = require("../../../controllers/api/products/product.controller.js");
const productFlightController = require("../../../controllers/api/products/productFlight.controller.js");
const productFacilityController = require("../../../controllers/api/products/productFacility.controller.js");
const productHotelController = require("../../../controllers/api/products/productHotel.controller.js");
const productItineraryController = require("../../../controllers/api/products/productItinerary.controller.js")
const productNoteController = require("../../../controllers/api/products/productNote.controller.js")
const productSnKController = require("../../../controllers/api/products/productSnK.controller.js");
const productPriceController = require("../../../controllers/api/products/productPrices.controller.js")
const productWishlistController = require("../../../controllers/api/products/productWishlist.controller.js");
const {ensureAuthToken} = require("../../../middleware/authJwt.js");
const appSignature = require("../../../middleware/appSignatureGuard.js")
const crypto = require('crypto');
const multer = require('multer');
const path = require('path');
const router = express.Router();
router.use(injectUser);

const FILE_TYPE = {
  "image/png": true,
  "image/jpeg": true,
  "image/jpg": true,
  "image/webp": true
};

const diskStrorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE[file.mimetype];
    let uploadError = new Error('Invalid image type: JPG, JPEG, PNG, WEBP only allowed');

    // 💡 TESTING: Direct ke folder external_assets di root domain
    const UPLOAD_BASE_DIR = process.env.NODE_ENV === 'production' 
      ? path.resolve(process.cwd(), "../../../external_assets")
      : path.join(__dirname, "../../../public/assets/img/products");

    // Auto-create folder jika belum ada
    if (!fs.existsSync(UPLOAD_BASE_DIR)) {
      fs.mkdirSync(UPLOAD_BASE_DIR, { recursive: true });
    }

    if (isValid) {
      uploadError = null;
    }

    cb(uploadError, UPLOAD_BASE_DIR);
  },
  filename: function(req, file, cb) {
     const ext = file.originalname.split(".").pop();
     const hash = crypto.randomBytes(16).toString('hex'); 
     cb(null, `${hash}.${ext}`);
  }
});

// const diskStrorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     const isValid = FILE_TYPE[file.mimetype];
//     let uploadError = new Error('Invalid image type: JPG, JPEG, PNG, WEBP only allowed');

//     // 💡 FIX 1: Gunakan '===' untuk pengecekan environment
//     const UPLOAD_BASE_DIR = process.env.NODE_ENV === 'production' 
//       ? path.resolve(process.cwd(),"/external_assets/img/products")
//       : path.join(__dirname, "../../../public/assets/img/products");

//     let uploadPath = UPLOAD_BASE_DIR;

//     // 💡 FIX 2: Gunakan path.join agar penanganan slash aman di Linux/Mac/Windows
//     if (file.fieldname === "thumbnail") {
//       uploadPath = path.join(uploadPath, "thumbnails");
//     }

//     if (file.fieldname === "hotel_image_mekkah" || file.fieldname === "hotel_image_madinah") {
//       uploadPath = path.join(uploadPath, "hotels");
//     }

//     if(!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, {recursive: true});
//     }

//     if (isValid) {
//       uploadError = null;
//     }

//     cb(uploadError, uploadPath);
//   },
//   filename: function(req, file, cb) {
//      const ext = file.originalname.split(".").pop();
//      const hash = crypto.randomBytes(16).toString('hex'); 
//      cb(null, `${hash}.${ext}`);
//   }
// });

const upload = multer({storage: diskStrorage})

router.get("/landing",  productController.getProductForLanding);
router.get("/",  appSignature, productController.getAllProduct);
router.get("/datatables",  productController.getAllProductsDatatables);
router.get("/:id",appSignature, productController.getProductById);
router.get("/:id/flights/", productFlightController.getFlightsByProduct);
router.get("/:id/facilities/", productFacilityController.getFacilitiesByProduct);
router.get("/:id/hotels/", productHotelController.getHotelByProduct);
router.get("/:id/itineraries/", productItineraryController.getItinerariesByProduct);
router.get("/:id/notes/", productNoteController.getNotesByProduct);
router.get("/:id/snk/", productSnKController.getSnkByProduct);
router.get("/:id/prices/", productPriceController.index);

// Wishlist routes
// router.get("/wishlist/:product_id",ensureAuthToken , productWishlistController.checkWishlist);

// router.post("/wishlist/toggle",ensureAuthToken , productWishlistController.toggleWishlist);

router.post("/", appSignature, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'hotel_image_mekkah', },
    { name: 'hotel_image_madinah', }
]), productController.createProduct);
router.put("/:id", appSignature, upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'hotel_image_mekkah', },
    { name: 'hotel_image_madinah', }
]), productController.updateProduct);
// Update product status (publish/draft/closed)
router.put('/:id/status', appSignature, productController.updateStatus);
router.delete("/:id", appSignature, productController.deleteProduct);


module.exports = router;
