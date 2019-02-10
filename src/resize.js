const sharp = require('sharp');
const stream = require('stream')
const AWS = require('aws-sdk')
const S3 = new AWS.S3({ signatureVersion: 'v4' });

// create constants
const BUCKET = process.env.BUCKET;
const URL = `https://s3-${process.env.REGION}.amazonaws.com/${process.env.BUCKET}`

/* 
 * Move this to utils
 * Utils Start
 */
// create the read stream abstraction for downloading data from S3
const readStreamFromS3 = ({ Bucket, Key }) => {
  console.log(`Getting Object from ${Bucket}/${Key}`)
  return S3.getObject({ Bucket, Key }).createReadStream()
}

// create the write stream abstraction for uploading data to S3
const writeStreamToS3 = ({ Bucket, Key }) => {
  console.log(`Uploading Object to ${Bucket}/${Key}`)
  const pass = new stream.PassThrough()
  return {
    writeStream: pass,
    uploadFinished: S3.upload({
      Body: pass,
      Bucket,
      ContentType: 'image/png',
      Key
    }).promise()
  }
}

// sharp resize stream
const streamToSharp = (size = 768) => {
  return sharp()
    .resize(size)
    .withMetadata();
}
/* Utils End */

exports.handler = async (event) => {
  // originals are stored at:
  // images/{env}/{date}/{uuid}/{filename}
  console.log('originalKey raw ::', event.Records[0].s3.object.key);
  const originalKey = unescape(event.Records[0].s3.object.key.replace(/\+/g, ' '));
  console.log('originalKey escaped ::', originalKey);
  // processed images will be stored at:
  // images/processed/{env}/{date}/{uuid}/{filename}
  const keys = originalKey.split('/')
  keys.splice(1, 0, 'processed');
  const newKey = keys.join('/');
  const imageLocation = `${URL}/${newKey}`;

  console.log('~~~~~~~~~~~~~~~~~~');
  console.log('Target Key ::', newKey);
  console.log('Target Path :: ', imageLocation);
  console.log('~~~~~~~~~~~~~~~~~~');
  try {
    // create the read and write streams from and to S3 and the Sharp resize stream
    const readStream = readStreamFromS3({ Bucket: BUCKET, Key: originalKey });
    const resizeStream = streamToSharp();
    const { 
      writeStream, 
      uploadFinished 
    } = writeStreamToS3({ Bucket: BUCKET, Key: newKey })
    
    // trigger the stream
    readStream
      .pipe(resizeStream)
      .pipe(writeStream)

    // wait for the stream to finish
    const uploadedData = await uploadFinished

    // log data
    console.log('Resized Data: ', {
      ...uploadedData,
      BucketEndpoint: URL,
      ImageURL: imageLocation
    })
    
    // return a 301 redirect to the newly created resource in S3
    return {
      statusCode: '301',
      headers: { 'location': imageLocation },
      body: ''
    }
  } catch (err) {
    console.error('Image Resize Exception ::', err)
    return {
      statusCode: '500',
      body: err.message
    }
  }
}