const multer = require('multer');
const path = require('path');

const storageExcel = multer.diskStorage({
    destination: './public/uploads/',
    filename: (req, file, callback) => {
        // ghi file execl vào folder uploads
        callback(null, file.originalname);
    }
});

// init upload file
const uploadFile = multer({
    storage: storageExcel,
    fileFilter: (req, file, callback) => {
        checkFileType(file, callback);
    }
}).single('myFileKH');

// check file execl
function checkFileType(file, callback) {
    // Allowed ext
    const filetype = /xlsx/;
    const extname = filetype.test(path.extname(file.originalname).toLowerCase());

    if (extname)
        return callback(null, true);
    else
        callback('Error upload file');
}
// ------------------------ upload image ------------------------ //
const storageImage = multer.diskStorage({
    destination: './public/images/',
    filename: (req, file, callback) => {
        // ghi file execl vào folder uploads
        callback(null, file.originalname);
    }
});
// init upload image
const uploadImage = multer({
    storage: storageImage,
    fileFilter: (req, file, callback) => {
        checkFileTypeImage(file, callback);
    }
}).single('urllogo');
// check file imgae
function checkFileTypeImage(file, callback) {
    // Allowed ext
    const filetype = /jpeg|jpg|png|gif/;
    const extname = filetype.test(path.extname(file.originalname).toLowerCase());

    if (extname)
        return callback(null, true);
    else
        callback('Error upload file');
}

module.exports = {
    uploadFile: uploadFile,
    uploadImage: uploadImage
}