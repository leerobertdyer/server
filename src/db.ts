import { Pool }  from 'pg'

// Use your actual connection string, ideally from an environment variable
const connectionString = process.env.DATABASE_URL;

const pool = new Pool({
  connectionString,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
  maxLifetimeSeconds: 60

});

export default pool;