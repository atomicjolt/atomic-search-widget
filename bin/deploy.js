const { S3Client, PutObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');

const [, , version, env] = process.argv;

const s3 = new S3Client();

const buckets = {
  dev: 'jsdev.atomicsearchwidget.com',
  beta: 'jsbeta.atomicsearchwidget.com',
  prod: 'js.atomicsearchwidget.com',
};

function uploadFile(bucket, filePath) {
  const fileContent = fs.readFileSync(`build/prod/${filePath}`);

  const params = {
    Body: fileContent,
    Bucket: bucket,
    Key: filePath,
    Tagging: `VERSION=${version}`,
  };

  const put = new PutObjectCommand(params);

  s3.send(put).then(
    (data) => {
      console.log('success!', data);
    },
    (err) => {
      console.error(err, err.stack);
      process.exit(1);
    },
  );
}

const bucket = buckets[env];
if (!bucket) {
  console.error(
    'environment (dev, beta or prod) must be provided as an argument',
  );
  process.exit(1);
} else if (!version) {
  console.error('you must deploy from a tagged commit');
  process.exit(1);
} else if (!s3.config.credentials) {
  console.error('AWS credentials must be provided as environment variables');
  process.exit(1);
} else {
  uploadFile(bucket, 'atomic_search_widget.js');
  uploadFile(bucket, 'brightspace.js');
  uploadFile(bucket, 'brightspace_enhanced.js');
}
