import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import {
  createSuccessResponse,
  createErrorResponse,
} from '../../../utils/api-response';
import {
  BadRequestError,
  InternalServerRequestError,
} from '../../../helpers/errors';

export const handler = async (event) => {
  const queryParams = event.queryStringParameters;

  const { REGION, UPLOAD_BUCKET_NAME } = process.env;

  if (!queryParams.name) {
    return createErrorResponse(new BadRequestError('Name was not passed.'));
  }

  const s3Client = new S3Client({ region: REGION });

  try {
    const objectKey = `uploaded/${queryParams.name}`;

    const params = {
      Bucket: UPLOAD_BUCKET_NAME,
      Key: objectKey,
    };

    const putObjectCommand = new PutObjectCommand(params);
    await s3Client.send(putObjectCommand);

    const url = await getSignedUrl(s3Client, putObjectCommand, {
      expiresIn: 3600,
    });

    console.log(
      `Generated signed URL for s3://${UPLOAD_BUCKET_NAME}/${objectKey}:`
    );
    console.log(url);

    return createSuccessResponse({
      message: `${queryParams.name} was created`,
      url,
    });
  } catch (error) {
    console.log(error);
    return createErrorResponse(
      new InternalServerRequestError('Something failed. Take a look at logs.')
    );
  }
};
