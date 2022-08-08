let { upload }   = require('./config/cf_multer');
let uploadSingle = upload.single('file');
let uploadArray  = upload.array('files');
let uploadFields = upload.fields([{ name: 'images', maxCount: 5 }]);

module.exports = {
    uploadSingle,
    uploadArray,
    uploadFields
}
