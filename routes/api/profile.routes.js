const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/api/profile.controller');
const {ensureAuthToken} = require("../../middleware/authJwt");

// Middleware untuk check authentic (opsional, sesuaikan dengan middleware Anda)
// const ensureAuthToken = (req, res, next) => {
//     if (!req.session || !req.user) {
//         return res.status(401).json({ status: 'error', message: 'Silakan login terlebih dahulu' });
//     }
//     next();
// };


// router.get('/my-profile', ensureAuthToken, profileController.getMyProfile);

router.get("/my-profile", ensureAuthToken, (req, res) => {
  res.json({
    user: req.user
  })
}),
router.get('/my-profile/:id', ensureAuthToken, profileController.getProfileById);
router.post('/my-profile', ensureAuthToken, profileController.createProfile);
router.put('/my-profile/:id', ensureAuthToken, profileController.updateProfile);
router.delete('/my-profile/:id', ensureAuthToken, profileController.deleteProfile);

module.exports = router;
