export const formatResponseOK = (message: any = 'OK', code = 200) => ({
  statusCode: code,
  headers: {
    'Access-Control-Allow-Origin': '*',
  },
  body: JSON.stringify(message),
});
