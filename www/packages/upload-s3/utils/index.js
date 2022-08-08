let { config } = require('../constants');
let AWS        = require('aws-sdk');

AWS.config.update({
    accessKeyId: config.aws_access_key_id,
    secretAccessKey: config.aws_secret_access_key,
    region: config.aws_region,
})
let s3Object = new AWS.S3();

// link từ s3 upload file
let render_link_upload_file_s3 = ({ fileName, type }) =>{
    try {
        let bucket = `${config.bucket}/root`;

        let url = s3Object.getSignedUrl('putObject', {
            Bucket: bucket,
            Key: fileName,
            Expires: config.signedUrlExpireSeconds,
            ACL: "public-read",
            ContentType: type,
        });

        console.log({ url_sign: url }) 
        return { error: false, url };
    } catch (error) {
        return  { error: true, message: 'cant_create_url' }
    }
}

function render_link_upload_s3(fileName, type) {
    return new Promise(async resolve => {
        try {
            if(!fileName || !type)
                return resolve({ error: true, message: "params_invalid" });
            let result = await render_link_upload_file_s3({fileName, type });
            if(!result.error){
                return resolve({ error: false, data: result });
            }else{
                return resolve({ error: true, message: "Error" });
            }
        } catch (error) {
            return resolve({ error: true, message: error.message });
        }
    })
}

const uploadFile = (pathFile, key) => {
    return new Promise( resolve => {
        try {
            // Read content from the file
            // const fileContent = fs.readFileSync(pathFile);
            // console.log({ pathFile });
            let parseBase64ToBuffer = Buffer.from(pathFile.replace(/^data:image\/\w+;base64,/, ""),'base64')
            // console.log({ fileContent });
            let bucket = `${config.bucket}/root`;
            // Setting up S3 upload parameters
            const params = {
                ContentEncoding: 'base64',
                ContentType: 'image/jpeg',
                ACL:'public-read',
                Bucket: bucket,
                Key: key,
                Body: parseBase64ToBuffer
            };

            // Uploading files to the bucket
            s3Object.upload(params, function(err, data) {
                if (err) {
                    console.log({ err });
                    throw err;
                }
                return resolve({ error: false, data: data });
            });

        } catch (error) {
            return resolve({ error: true, message: error.message })
        }
    })
    
};

exports.GENERATE_LINK_S3 = render_link_upload_s3;
exports.UPLOAD_FILE_S3   = uploadFile;
