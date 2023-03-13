import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import csv from 'csv-parser';

export const handler = async (event) => {
  const { REGION, UPLOAD_BUCKET_NAME } = process.env;
  const s3Client = new S3Client({ region: REGION });
  try {
    console.log('Start lambda executing....');
    for (const record of event.Records) {
      const bucketParams = {
        Bucket: UPLOAD_BUCKET_NAME,
        Key: record.s3.object.key,
      };

      console.log('Start parsing....');

      const getObject = new GetObjectCommand(bucketParams);
      const s3Object = await s3Client.send(getObject);

      s3Object.Body.pipe(csv()).on('end', () => {
        console.log('CSV file successfully parsed');
      });

      console.log(`Data for ${record.s3.object.key}:`);

      const copyObjectCommand = new CopyObjectCommand({
        Bucket: process.env.UPLOAD_BUCKET_NAME,
        CopySource: process.env.UPLOAD_BUCKET_NAME + '/' + record.s3.object.key,
        Key: record.s3.object.key.replace('uploaded', 'parsed'),
      });

      const { CopyObjectResult } = await s3Client.send(copyObjectCommand);

      console.log(`${record.s3.object.key} copied`);
      console.log(`ETag of new object: ${CopyObjectResult.ETag}`);

      const deleteObjectCommand = new DeleteObjectCommand(bucketParams);

      await s3Client.send(deleteObjectCommand);

      console.log(`${record.s3.object.key} deleted`);
      console.log('Lambda  finished successfully........');
    }

    return { statusCode: 202 };
  } catch (error) {
    console.error('Error during executing');
    console.error(error);
    return { statusCode: 500 };
  }
};
