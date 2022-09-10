let { upload }   = require('./config/cf_multer');
let uploadSingle = upload.single('file');
let uploadArray  = upload.array('images', 12);
let uploadFields = upload.fields([
    { name: 'citizenIdentificationFront', maxCount: 1 },
    { name: 'citizenIdentificationBack', maxCount: 1 },
    { name: 'drivingLicenseFront', maxCount: 1 },
    { name: 'drivingLicenseBack', maxCount: 1 },
]);

module.exports = {
    uploadSingle,
    uploadArray,
    uploadFields,
}
