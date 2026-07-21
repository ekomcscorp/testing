const express = require('express');
const transactionJamaahController = require('../../../controllers/api/transactions/transaction_jamaah.controller');
const { injectUser } = require('../../../middleware');
const { ensureAuthToken } = require("../../../middleware/authJwt");


const router = express.Router();
const multer = require('multer');


/**
 * @route POST /api/transactions/bulk
 * @desc Create multiple jamaah sekaligus (HARUS SEBELUM /:id)
 * @access Private
 * @body {Array} jamaahList - Array of jamaah data
 */
router.post('/bulk', transactionJamaahController.createBulkJamaah);

/**
 * @route GET /api/transactions/jamaah/datatables
 * @desc Get jamaah untuk datatable dengan pagination (HARUS SEBELUM /:id)
 * @access Private (requires injectUser untuk akses check)
 */
router.get('/datatables', injectUser, transactionJamaahController.getAllJamaahDatatables);

/**
 * @route GET /api/transactions/jamaah/statistics
 * @desc Get statistics/summary jamaah (HARUS SEBELUM /:id)
 * @access Public
 */
router.get('/statistics', transactionJamaahController.getStatistics);

/**
 * @route GET /api/transactions/jamaah/filter
 * @desc Get jamaah with custom filter (gender, status, date range, dll) (HARUS SEBELUM /:id)
 * @access Public
 */
router.get('/filter', transactionJamaahController.getWithFilter);

/**
 * @route GET /api/transactions/jamaah/search/name
 * @desc Search jamaah berdasarkan nama (HARUS SEBELUM /:id)
 * @access Public
 * @query {String} q - Query untuk pencarian
 */
router.get('/search/name', transactionJamaahController.searchByName);

/**
 * @route GET /api/transactions/jamaah/search/email
 * @desc Search jamaah berdasarkan email (HARUS SEBELUM /:id)
 * @access Public
 * @query {String} q - Query untuk pencarian
 */
router.get('/search/email', transactionJamaahController.searchByEmail);

/**
 * @route GET /api/transactions/:transactionId/jamaah
 * @desc Get semua jamaah dari satu transaksi (HARUS SEBELUM /:id)
 * @access Public
 * @param {Number} transactionId - Transaction ID
 */
router.get('/transaction/:transactionId', transactionJamaahController.getJamaahByTransaction);

/**
 * @route GET /api/transactions/jamaah
 * @desc Get all jamaah with optional filters
 * @access Public (dapat override dengan middleware jika diperlukan)
 */
router.get('/', transactionJamaahController.getAllJamaah);

/**
 * @route POST /api/transactions/jamaah
 * @desc Create jamaah baru
 * @access Private (optional - jalankan validasi sendiri di controller jika tidak ada auth)
 * @body {Object} jamaahData - Jamaah data
 */
router.post('/', transactionJamaahController.createJamaah);

/**
 * @route GET /api/transactions/jamaah/:id
 * @desc Get jamaah berdasarkan ID
 * @access Public
 * @param {Number} id - Jamaah ID
 */
router.get('/:id', transactionJamaahController.getJamaahById);

/**
 * @route PUT /api/transactions/jamaah/:id
 * @desc Update jamaah berdasarkan ID
 * @access Private
 * @param {Number} id - Jamaah ID
 * @body {Object} updateData - Data untuk di-update
 */
router.put('/:id', transactionJamaahController.updateJamaah);

/**
 * @route DELETE /api/transactions/jamaah/:id
 * @desc Delete jamaah
 * @access Private
 * @param {Number} id - Jamaah ID
 */
router.delete('/:id', transactionJamaahController.deleteJamaah);

module.exports = router;
