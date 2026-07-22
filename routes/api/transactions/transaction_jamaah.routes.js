const express = require('express');
const transactionJamaahController = require('../../../controllers/api/transactions/transaction_jamaah.controller');
const { injectUser } = require('../../../middleware');
const { ensureAuthToken } = require("../../../middleware/authJwt");


const router = express.Router();
const multer = require('multer');
const crypto = require("crypto");


const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, "public/assets/img/transactions/jamaah/")
    },
    filename: function(req, file, cb) {
        const ext = file.originalname.split(".").pop();
        const hash = crypto.randomBytes(16).toString('hex');
        cb(null, `${hash}.${ext}`);
    }
})
const upload = multer({storage: storage});

router.post('/bulk', transactionJamaahController.createBulkJamaah);

router.get('/datatables', injectUser, transactionJamaahController.getAllJamaahDatatables);

router.get('/statistics', transactionJamaahController.getStatistics);


router.get('/filter', transactionJamaahController.getWithFilter);

router.get('/search/name', transactionJamaahController.searchByName);

router.get('/search/email', transactionJamaahController.searchByEmail);

router.get('/transaction/:transactionId', transactionJamaahController.getJamaahByTransaction);

router.get('/', transactionJamaahController.getAllJamaah);

router.post('/', upload.fields([
    { name: 'img_ktp', maxCount: 1},
    { name: 'img_kk', maxCount: 1},
    { name: 'img_passpor', maxCount: 1},
    { name: 'img_diri', maxCount: 1},
    { name: 'img_akta_kelahiran', maxCount: 1}
]) ,transactionJamaahController.createJamaah);

router.get('/:id', transactionJamaahController.getJamaahById);

router.put('/:id',upload.fields([
    { name: 'img_ktp', maxCount: 1},
    { name: 'img_kk', maxCount: 1},
    { name: 'img_passpor', maxCount: 1},
    { name: 'img_diri', maxCount: 1},
    { name: 'img_akta_kelahiran', maxCount: 1}
]), transactionJamaahController.updateJamaah);

router.delete('/:id', transactionJamaahController.deleteJamaah);

module.exports = router;
