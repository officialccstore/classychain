require('dotenv').config();
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({
    select: { email: true, name: true, role: true }
  });
  
  console.log('\n=== All Users in Database ===\n');
  users.forEach(u => {
    console.log(`Email: ${u.email}`);
    console.log(`Name: ${u.name}`);
    console.log(`Role: ${u.role}`);
    console.log('---');
  });
  
  await prisma.$disconnect();
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
