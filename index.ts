import * as AWS from 'aws-sdk';
import * as sharp from 'sharp';

const SRC_FOLDER = process.env.SRC_FOLDER || 'original';
const VALID_TYPES = (process.env.VALID_TYPES || 'png,jpg,jpeg,gif').split(',');
const maxWidth = parseFloat(process.env.DEST_SIZE || '750');
const destFolderName = process.env.DEST_FOLDER || `w${maxWidth}`;
const s3 = new AWS.S3();
const logger = console;

exports.handler = async (event, context) => {
    try {
        const Bucket = event.Records[0].s3.bucket.name;
        const Key = event.Records[0].s3.object.key;
        const DestKey = Key.replace(SRC_FOLDER, destFolderName);

        if (!isSupportedType(Key)) {
            return;
        }
        logger.log(`Read ${Bucket}/${Key} stream`);
        const {Body: imageBuffer} = await s3.getObject({Bucket, Key}).promise();

        logger.log(`Resize ${Bucket}/${Key}`);
        const resizedImagerBuffer = await sharp(imageBuffer as Buffer).resize(maxWidth).rotate().toBuffer();

        logger.log(`Upload ${Bucket}/${Key}`);
        await s3.upload({Bucket, Key: DestKey, Body: resizedImagerBuffer}).promise();

    } catch (e) {
        logger.error(e);
        context.done();
    }
};

const isSupportedType = key => {
    const typeMatch = key.match(/\.([^.]*)$/);
    if (!typeMatch) {
        logger.error('Unable to infer image type for key ' + key);
        return false;
    }
    const imageType = typeMatch[1];
    if (VALID_TYPES.indexOf(imageType.toLowerCase()) < 0) {
        logger.log('Skipping non-image ' + key);
        return false;
    }
    return true;
};
