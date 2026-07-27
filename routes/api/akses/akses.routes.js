const express = require("express");
const aksesController = require("../../../controllers/api/akses.controller.js");
const appSignature = require("../../../middleware/appSignatureGuard.js")
const router = express.Router();

router.get("/",appSignature, aksesController.getAllAkses);
router.get("/by-level/:id_level", aksesController.getAksesByLevel);
router.get("/:id", aksesController.getAksesById);
router.post("/", aksesController.createAkses);
router.put("/:id", aksesController.updateAkses);
router.delete("/:id", aksesController.deteleAkses);

module.exports = router;
