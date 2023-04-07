export const formatResponseError = ({ message, code = 500 }) => ({
  statusCode: code,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify({
    errorMessage: message,
  }),
});
