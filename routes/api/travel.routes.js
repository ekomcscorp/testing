const express = require('express');
const router = express.Router();
const travelRekeningController = require('../../controllers/api/travel_rekening.controller');
const { ensureAuthToken } = require('../../middleware/authJwt');
const appSignature = require("../../middleware/appSignatureGuard.js");

// Pasang appSignature di seluruh route file ini (opsional tapi disarankan demi konsistensi)
router.use(appSignature);

// ==========================================
// TRAVEL ENDPOINTS (AUTHENTICATED)
// ==========================================

//-> Travel lihat daftar rekening sendiri
router.get('/rekening', ensureAuthToken, travelRekeningController.getMyRekening);

//-> Travel atur izinkan/tolak marketplace (Wajib sebelum /:id)
router.put('/rekening/toggle-marketplace', ensureAuthToken, travelRekeningController.toggleMarketplace);

// -> Travel tambah rekening baru
router.post('/rekening', ensureAuthToken, travelRekeningController.createRekening);

// -> Travel update rekening
router.put('/rekening/:id', ensureAuthToken, travelRekeningController.updateRekening);

// -> Travel hapus rekening
router.delete('/rekening/:id', ensureAuthToken, travelRekeningController.deleteRekening);


// ==========================================
// JAMAAH ENDPOINTS (PUBLIC / AUTH)
// ==========================================

//  -> Jamaah lihat opsi rekening tujuan
router.get('/products/:productId/payment-options', travelRekeningController.getProductPaymentOptions);

module.exports = router;