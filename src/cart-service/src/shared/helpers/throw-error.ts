export const throwError = (message: string, code = 500) => {
  throw { code, message };
};
