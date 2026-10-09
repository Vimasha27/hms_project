import EmbeddedPostgres from 'embedded-postgres';
import path from 'path';

async function main() {
  const dbPath = path.join(__dirname, '..', 'data', 'db');
  console.log(`🚀 Initializing PostgreSQL cluster at ${dbPath}...`);

  const pg = new EmbeddedPostgres({
    databaseDir: dbPath,
    port: 5432,
    user: 'postgres',
    password: 'password',
    persistent: true,
  });

  try {
    await pg.initialise();
    console.log('📦 Cluster initialized.');
  } catch (err: any) {
    if (err.message && err.message.includes('already exists')) {
      console.log('📦 Cluster already exists, proceeding.');
    } else {
      console.log('ℹ️ Cluster init status:', err.message);
    }
  }

  console.log('🔌 Starting PostgreSQL server on port 5432...');
  await pg.start();
  console.log('✅ PostgreSQL running on port 5432!');

  try {
    await pg.createDatabase('hms_db');
    console.log('✅ Database "hms_db" created.');
  } catch (err: any) {
    console.log('ℹ️ Database "hms_db" already exists or created.');
  }

  console.log('🎉 PostgreSQL is ready for connections at:');
  console.log('   postgresql://postgres:password@localhost:5432/hms_db');
}

main().catch((e) => {
  console.error('Failed to start PostgreSQL:', e);
});
