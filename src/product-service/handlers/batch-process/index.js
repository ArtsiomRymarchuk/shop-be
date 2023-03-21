import { SNSClient, PublishCommand } from '@aws-sdk/client-sns';
import { pool } from '../../../service/postgres';
import { createProduct } from '../../../service/product';

export const handler = async (event) => {
  const { REGION } = process.env;

  const snsClient = new SNSClient({ region: REGION });
  const client = await pool.connect();

  try {
    for (const record of event.Records) {
      const data = JSON.parse(record.body);

      const newProduct = await createProduct(data, client);

      if (newProduct) {
        const publishCommand = new PublishCommand({
          Subject: 'New product created',
          Message: JSON.stringify(data),
          MessageAttributes: {
            title: {
              DataType: 'String',
              StringValue: data.title,
            },
          },
          TopicArn: process.env.SNS_ARN,
        });

        const snsResponse = await snsClient.send(publishCommand);
        console.log('Message sent successfully:', snsResponse.MessageId);
      }
    }

    return { statusCode: 202 };
  } catch (error) {
    console.log(error);

    return { statusCode: 500 };
  } finally {
    client.release();
  }
};
