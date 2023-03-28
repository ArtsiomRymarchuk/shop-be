import { GITHUB_NAME } from '../../../constants';
import { generateResponse } from '../../../utils/authorization-response';

export const handler = (event, context, callback) => {
  console.log(event);

  if (event.type !== 'TOKEN') {
    callback('Error: Token type missed.');
  }

  const encodedToken = event.authorizationToken.split('Basic ')[1];

  if (!encodedToken) {
    callback(null, generateResponse('user', 'Deny', event.methodArn));
  }

  const token = Buffer.from(encodedToken, 'base64').toString();
  const [user, password] = token.split('=');

  console.log('token', token);

  if (user === GITHUB_NAME && password === process.env[GITHUB_NAME]) {
    callback(null, generateResponse('user', 'Allow', event.methodArn));
  } else {
    callback(null, generateResponse('user', 'Deny', event.methodArn));
  }
};
