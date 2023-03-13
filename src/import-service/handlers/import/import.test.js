import AWSMock from 'aws-sdk-mock';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { createErrorResponse } from '../../../utils/api-response';
import { BadRequestError } from '../../../helpers/errors';
import { handler } from './import';

jest.mock('../../../utils/api-response', () => ({
  createSuccessResponse: jest.fn(),
  createErrorResponse: jest.fn(),
}));

AWSMock.mock('S3Client', 'send', (command, callback) => {
  if (command instanceof PutObjectCommand) {
    callback(null, { ETag: 'mock-etag' });
  } else {
    callback(new Error('Invalid command'));
  }
});

AWSMock.mock('S3', 'getSignedUrl', function (method, params, callback) {
  callback(null, 'https://aws:s3:test.csv');
});
jest.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: jest.fn(),
}));
describe('import', () => {
  beforeEach(() => {
    // Reset the mock before each test
    mockPutObject.mockClear();
  });
  test('should return error if name was not passed', async () => {
    await handler({ queryStringParameters: {} });

    expect(createErrorResponse).toHaveBeenCalledWith(
      new BadRequestError('Name was not passed.')
    );
  });

  test.skip('should return signed url', async () => {
    await handler({ queryStringParameters: { name: 'test.csv' } });

    expect(getSignedUrl).toHaveBeenCalled();
  });
});
