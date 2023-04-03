export interface User {
  id?: string;
  name: string;
  email?: string;
  password?: string;
}

export const userTableName = 'users';

export const userTableValues = 'id, name, email, password';