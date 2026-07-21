/**
 * CLI wrapper around seedDemoData(). Run with: npm run db:seed
 * The same logic is also exposed as a "Seed demo data" button on /admin
 * (protected by ADMIN_TOKEN) for deployments managed without a terminal.
 */
import 'dotenv/config';
import {seedDemoData} from '../src/lib/db/seed';

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL is required. Copy .env.example to .env first.');
    process.exit(1);
  }
  console.log('Seeding demo data…');
  const {items} = await seedDemoData();
  console.log('Done. Upserted', items, 'top-level rows.');
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
