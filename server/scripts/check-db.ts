import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

function maskDatabaseUrl(urlStr?: string): string {
  if (!urlStr) return '(not set)';
  try {
    const parsed = new URL(urlStr);
    const maskedUser = parsed.username ? '***' : '';
    const maskedPass = parsed.password ? ':***@' : (parsed.username ? '@' : '');
    return `${parsed.protocol}//${maskedUser}${maskedPass}${parsed.host}${parsed.pathname}${parsed.search}`;
  } catch {
    return urlStr.replace(/:([^:@]+)@/, ':***@');
  }
}

async function checkDatabase() {
  const dbUrl = process.env.DATABASE_URL;

  console.log('========================================================');
  console.log('🔍 CareSync HMS Database Connection Check');
  console.log('========================================================');
  console.log(`📡 Target URL: ${maskDatabaseUrl(dbUrl)}`);

  if (!dbUrl) {
    console.error('❌ Error: DATABASE_URL is not set in server/.env');
    process.exit(1);
  }

  const isLocalhost = dbUrl.includes('localhost') || dbUrl.includes('127.0.0.1');
  console.log(`🌐 Mode: ${isLocalhost ? 'Local Database' : 'Cloud / Remote Database'}`);
  console.log('⏳ Connecting...');

  const prisma = new PrismaClient();

  try {
    const startTime = Date.now();
    await prisma.$connect();

    // Query database version
    const versionResult: Array<{ version: string }> = await prisma.$queryRaw`SELECT version();`;
    const latency = Date.now() - startTime;

    console.log(`✅ Connection established successfully in ${latency}ms!`);
    if (versionResult && versionResult[0]) {
      const fullVer = versionResult[0].version;
      const shortVer = fullVer.split(',')[0] || fullVer;
      console.log(`🐘 Engine: ${shortVer}`);
    }

    // Check tables / schema
    const userCount = await prisma.user.count().catch(() => null);

    if (userCount === null) {
      console.log('\n⚠️  Schema tables not yet created on this database.');
      console.log('👉 To apply database schema, run:');
      console.log('   npm run db:push   (or npm run prisma:migrate)');
      console.log('👉 To populate initial demo data, run:');
      console.log('   npm run prisma:seed');
    } else {
      console.log(`📊 Schema Status: Tables verified (Users count: ${userCount})`);
      if (userCount === 0) {
        console.log('\n💡 Tip: Your database is empty. You can seed demo data with:');
        console.log('   npm run prisma:seed');
      }
    }

    console.log('========================================================');
    console.log('🎉 Database is ready for HMS Backend services!');
    console.log('========================================================');
    await prisma.$disconnect();
    process.exit(0);
  } catch (err: any) {
    console.error('\n❌ Database connection failed!');
    console.error(`Reason: ${err.message || err}`);

    console.log('\n🔧 Troubleshooting Guide:');
    if (isLocalhost) {
      console.log('  Local PostgreSQL:');
      console.log('  1. Make sure your local PostgreSQL service is running on port 5432.');
      console.log('  2. Or start Docker container: docker compose up -d');
      console.log('  3. Verify username, password, and port in server/.env');
    } else {
      console.log('  Cloud PostgreSQL:');
      console.log('  1. Verify connection string in server/.env (Supabase, Neon, RDS, Render, etc.).');
      console.log('  2. Ensure SSL is enabled: add "?sslmode=require" to the DATABASE_URL.');
      console.log('  3. Ensure IP access is allowed in cloud dashboard (allow 0.0.0.0/0 or your IP).');
      console.log('  4. Check for special characters in your password (URL-encode them if needed).');
    }

    await prisma.$disconnect().catch(() => {});
    process.exit(1);
  }
}

checkDatabase();
