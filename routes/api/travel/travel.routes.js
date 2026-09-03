const express = require("express");
const userController = require("../../../controllers/api/user.controller");
const { injectUser } = require("../../../middleware");
const appSignature = require("../../../middleware/appSignatureGuard.js")
const router = express.Router();


router.get("/datatables", injectUser, userController.getAllTravelsDatatables);

module.exports = router;