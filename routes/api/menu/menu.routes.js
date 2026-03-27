const express = require("express");
const menuController = require("../../../controllers/api/menu.controller");

const { injectUser } = require("../../../middleware");
const { ensureAuth } = require("../../../middleware/auth");
const { route } = require("../../auth.routes");

const router = express.Router();

router.get("/", menuController.getAllMenu);

router.get("/parent", menuController.getParentsController);
router.get("/parent/datatables", ensureAuth, injectUser, menuController.getParentPaginatedMenu);

router.get("/submenu/datatables", ensureAuth, injectUser, menuController.datatablesSubmenu);
router.get("/submenu", menuController.getSubmenu);


router.get("/nested", menuController.getNestedMenu);

// 🔥 WAJIB PALING BAWAH
router.get("/:id_menu", menuController.getMenuById);

router.post("/", menuController.createMenu);
router.put("/:id_menu", menuController.updateMenu);
router.delete("/:id_menu", menuController.deleteMenu);


module.exports = router;
