import {
  S3Client,
  GetObjectCommand,
  CopyObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs';
import csv from 'csv-parser';
import stream from 'stream';
import util from 'util';

const { REGION, UPLOAD_BUCKET_NAME, SQS_URL } = process.env;

const finished = util.promisify(stream.finished);
const s3Client = new S3Client({ region: REGION });
const sqsClient = new SQSClient({ region: REGION });

export const handler = async (event) => {
  const results = [];
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

      await finished(
        s3Object.Body.pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => {
            console.log('CSV file successfully parsed');
          })
      );

      console.log(`Data for ${record.s3.object.key}:`);
      results.map((item) => {
        sqsClient.send(
          new SendMessageCommand({
            MessageBody: JSON.stringify(item),
            QueueUrl: SQS_URL,
          })
        );
      });

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
