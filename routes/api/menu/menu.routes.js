const express = require("express");
const menuController = require("../../../controllers/api/menu.controller");

const { injectUser } = require("../../../middleware");
const { ensureAuth } = require("../../../middleware/auth");
const { route } = require("../../auth.routes");

const router = express.Router();

router.get("/", menuController.getAll);

router.get("/parent", menuController.getParentByLevel);
router.get("/parent/datatables", ensureAuth, injectUser, (req, res) => menuController.getDatatablesParent(req, res));

router.get("/submenu/datatables", ensureAuth, injectUser, (req, res) => menuController.getDatatablesSubmenu(req, res));
router.get("/submenu", menuController.getSubmenu);


router.get("/nested", menuController.getNested);

// 🔥 WAJIB PALING BAWAH
router.get("/:id_menu", menuController.getById);

router.post("/", menuController.create);
router.put("/:id_menu", menuController.update);
router.delete("/:id_menu", menuController.delete);


module.exports = router;
