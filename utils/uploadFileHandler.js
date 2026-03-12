const multer = require("multer");
const path = require("path");

const FILE_TYPE ={
    'image/png': 'png',
    'image/jpeg': 'jpeg',
    'image/jpg': 'jpg'
}

const diskStrorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE[file.mimetype];
    let uploadError = new Error('Invalid image type: JPG, JPEG, PNG only allowed');

    if(isValid){
        uploadError = null;
    }

    cb(uploadError, path.join(__dirname, "public/assets/img/uploads"));
  },
  filename: function(req, file, cb) {
    cb(null, file.originalname + "-" + Date.now() + path.extname(file.originalname));
  }
})

const upload = multer({storage: diskStrorage});

module.exports = { upload };