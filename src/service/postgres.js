import { Pool } from 'pg';

const { PGHOST, PGPORT, PGDATABASE, PGUSER, PGPASSWORD } = process.env;

const dbOptions = {
  host: PGHOST,
  port: PGPORT,
  database: PGDATABASE,
  user: PGUSER,
  password: PGPASSWORD,
  ssl: {
    rejectUnauthorized: false,
  },
  connectionTimeoutMillis: 5000,
};

export const pool = new Pool(dbOptions);
