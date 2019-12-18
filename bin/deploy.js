const AWS = require('aws-sdk');
const fs = require('fs');

const s3 = new AWS.S3();

const buckets = {
  dev: 'jsdev.atomicsearchwidget.com',
  beta: 'jsbeta.atomicsearchwidget.com',
  prod: 'js.atomicsearchwidget.com'
};

function uploadFile(bucket, filePath) {
  const fileContent = fs.readFileSync(`build/prod/${filePath}`);

  const params = {
    Body: fileContent,
    Bucket: bucket,
    Key: filePath,
  };

  s3.putObject(params, (err, data) => {
    if (err) {
      console.error(err, err.stack);
      process.exit(1);
    } else {
      console.log('success!', data);
    }
  });
}

const env = process.argv[2];
const bucket = buckets[env];
if (!bucket) {
  console.error('environment (dev, beta or prod) must be provided as an argument');
  process.exit(1);
} else if (!s3.config.credentials) {
  console.error('AWS credentials must be provided as environment variables');
  process.exit(1);
} else {
  uploadFile(bucket, 'atomic_search_widget.js');
}
