const express = require("express");
const userController = require("../../../controllers/api/user.controller");
const { injectUser } = require("../../../middleware");
const appSignature = require("../../../middleware/appSignatureGuard.js")

const router = express.Router();

router.get("/",appSignature, userController.getAllUsers);
router.get("/datatables", injectUser, userController.getAllUsersDatatables);

router.get("/:id", appSignature, userController.getUserById);
router.post("/", userController.createUser);
router.put("/:id", userController.updateUser);
// router.put("/:id/approve", userController.approveUser); // ✅ ini baru
router.delete("/:id", userController.deleteUser);


module.exports = router;
