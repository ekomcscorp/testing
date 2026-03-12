const express = require("express");
const userlevelController = require("../../controllers/api/userlevel.controller");
const { injectUser } = require("../../middleware/");
const { ensureAuth } = require("../../middleware/auth");

const router = express.Router();

router.get("/", userlevelController.getAllUserlevel);
router.get("/datatables", ensureAuth, injectUser, userlevelController.getAllUserlevelDatatables);
router.get("/by-level/:id_level", ensureAuth,injectUser, userlevelController.getUserlevelByLevel);
router.get("/:id", userlevelController.getUserlevelById);
router.post("/", userlevelController.createUserlevel);
router.post("/upsert-access", ensureAuth, injectUser, userlevelController.upsertAccess);
router.put("/:id", userlevelController.updateUserlevel);
router.delete("/:id", userlevelController.deleteUserlevel);

module.exports = router;
