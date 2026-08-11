const express = require('express');
const transactionController = require('../../../controllers/api/transactions/transaction.controller');
const transactionJamaahRoutes = require('./transaction_jamaah.routes');
const { injectUser } = require ('../../../middleware');
const { ensureAuthToken } = require("../../../middleware/authJwt");
const appSignature = require("../../../middleware/appSignatureGuard.js");
const path = require('path');
const fs = require('fs');
const router = express.Router();
const multer = require('multer');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: function(req, file, cb) {

        const uploadDir = path.join(__dirname, "../../../public/assets/img/transactions/")

        // untuk membuat folder baru jika folder tidak ada
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }

        cb(null, uploadDir);
    },
    filename: function(req, file, cb) {
        const ext = file.originalname.split(".").pop();
        const hash = crypto.randomBytes(16).toString('hex'); 
        cb(null, `${hash}.${ext}`);
    }
});
const upload = multer({ storage: storage });

// 📌 Nested routes untuk Transaction Jamaah (HARUS SEBELUM /:id route)
// Routes akan menjadi /api/transactions/jamaah/*
router.use("/jamaah", transactionJamaahRoutes);

// 📋 Transaction routes (Eksisting)
router.get("/", appSignature, transactionController.getAllTransactions);
router.get("/my-transactions", ensureAuthToken, transactionController.getMyTransactions);
router.get("/datatables", injectUser, transactionController.getAllTransactionDatatables);

// 💳 Fitur Cicilan 3x (Harus didefinisikan SEBELUM /:id agar tidak tertimpa route params)
router.post("/checkout-installment", ensureAuthToken, transactionController.createInstallmentTransaction);

router.put("/installments/:installment_id/upload", upload.single('evidence_url'), transactionController.uploadInstallmentPayment);

router.patch("/installments/:installment_id/status", injectUser, transactionController.updateInstallmentStatus);

// 📋 Transaction routes lanjutan (Eksisting)
router.get("/:id", appSignature, transactionController.getTransactionById);
router.post("/", ensureAuthToken, transactionController.createTransaction);
router.put("/:id", upload.single('evidence_url'), transactionController.uploadPayment);
router.patch("/:id", injectUser, transactionController.approvePayment);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;