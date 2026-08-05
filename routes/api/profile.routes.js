const express = require('express');
const router = express.Router();
const profileController = require('../../controllers/api/profile.controller');
const {ensureAuthToken} = require("../../middleware/authJwt");
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');


const diskStorage = multer.diskStorage({
  destination: function (req, file, cb ) {
    cb(null, "public/assets/img/profiles/")
  },
  filename: function(req, file, cb){
    const ext = file.originalname.split(".").pop();
    const hash = crypto.randomBytes(16).toString('hex');
    cb(null, `${hash}.${ext}`);
  }
})

const upload = multer({storage: diskStorage})


router.get("/my-profile", ensureAuthToken, profileController.getMyProfile),
// router.get('/my-profile', ensureAuthToken, profileController.getProfileById);
router.post('/my-profile', upload.single('image'), ensureAuthToken, profileController.createProfile);
router.put('/my-profile',upload.single('image'), ensureAuthToken, profileController.updateProfile);
router.delete('/my-profile', ensureAuthToken, profileController.deleteProfile);

module.exports = router;
