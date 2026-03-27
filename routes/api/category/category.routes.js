const express = require("express");
const CategoryController = require("../../../controllers/api/category.controller");
const { injectUser } = require("../../../middleware");

const router = express.Router();

router.get("/", CategoryController.getAllCategory);
router.get("/datatables", injectUser, CategoryController.getAllCategoryDatatables);
router.get("/:id", CategoryController.getCategoryById);
router.post("/", CategoryController.createCategory);
router.put("/:id", CategoryController.updateCategory);
router.delete("/:id", CategoryController.deleteCategory);

module.exports = router;
