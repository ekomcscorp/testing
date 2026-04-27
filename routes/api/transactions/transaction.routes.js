const express = require('express');
const transactionController = require('../../../controllers/api/transactions/transaction.controller');
const { injectUser } = require ('../../../middleware');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/assets/img/transactions/");
    },
    filename: function(req, file, cb) {
        const ext = file.originalname.split(".").pop();
        const hash = crypto.randomBytes(16).toString('hex'); 
        cb(null, `${hash}.${ext}`);
    }
})
const upload = multer({storage: storage});

router.get("/", transactionController.getAllTransactions);
router.get("/datatables", injectUser, transactionController.getAllTransactionDatatables);
router.get("/:id", transactionController.getTransactionById);
router.post("/", transactionController.createTransaction);
router.put("/:id", upload.single('evidence_url'),transactionController.uploadPayment);
router.patch("/:id", injectUser ,transactionController.approvePayment)
router.delete("/:id", transactionController.deleteTransaction);


module.exports = router; 