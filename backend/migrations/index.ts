import { mongoMigrateCli } from 'mongo-migrate-ts';
import { validateEnv } from '../src/config/env.config';

const MONGO_DB_URI = validateEnv()!.MONGO_DB_URI;

mongoMigrateCli({
  uri: MONGO_DB_URI,
//   database: 'db',
  migrationsDir: __dirname,
  migrationsCollection: 'migrations_collection',
});