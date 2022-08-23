var admin = require("firebase-admin");

var serviceAccount = require("./booking-be-firebase-adminsdk-41r4q-48cedb36e4.json");

const BUCKET = 'booking-be.appspot.com';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: BUCKET
});

const bucket = admin.storage().bucket();

const uploadImage = (req, res, next) => {
  if(!req.file) return next();

  const image = req.file;

  const URL_IMAGE = Date.now() + '.' + image.originalname.split('.').pop();

  const file = bucket.file(URL_IMAGE);

  const stream = file.createWriteStream({
    metadata: {
      contentType: image.mimetype
    }
  });

  stream.on('error', (error) => {
    console.log({ error })
  });

  stream.on('finish', async () => {
    await file.makePublic();

    req.file.firebaseURL = `https://storage.googleapis.com/${BUCKET}/${URL_IMAGE}`;

    next();
  });

  stream.end(image.buffer);
};

module.exports = uploadImage;

