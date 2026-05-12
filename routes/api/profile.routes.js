const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/api/profile.controller');
const {ensureAuthToken} = require("../../middleware/authJwt");


router.get("/my-profile", ensureAuthToken, profileController.getMyProfile),
// router.get('/my-profile', ensureAuthToken, profileController.getProfileById);
router.post('/my-profile', ensureAuthToken, profileController.createProfile);
router.put('/my-profile', ensureAuthToken, profileController.updateProfile);
router.delete('/my-profile', ensureAuthToken, profileController.deleteProfile);

module.exports = router;
