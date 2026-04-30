const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/api/profile.controller');

// Middleware untuk check authentic (opsional, sesuaikan dengan middleware Anda)
const ensureAuth = (req, res, next) => {
    if (!req.session || !req.session.user) {
        return res.status(401).json({ status: 'error', message: 'Silakan login terlebih dahulu' });
    }
    next();
};


router.get('/my-profile', ensureAuth, profileController.getMyProfile);
router.get('/:id', profileController.getProfileById);
router.post('/', ensureAuth, profileController.createProfile);
router.put('/:id', ensureAuth, profileController.updateProfile);
router.delete('/:id', ensureAuth, profileController.deleteProfile);

module.exports = router;
