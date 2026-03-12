const express = require('express');
const transactionController = require('../../controllers/api/transactions/transaction.controller');
const { injectUser } = require ('../../middleware');
const router = express.Router();

router.get("/", transactionController.getAllTransactions);
router.get("/datatables", injectUser, transactionController.getAllTransactionDatatables);
router.get("/:id", transactionController.getTransactionById);
router.post("/", transactionController.createTransaction);
router.put("/:id", transactionController.updateTransaction);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;