const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Create Teams
  const teamIT = await prisma.team.create({
    data: { name: 'IT Support' },
  });
  const teamMech = await prisma.team.create({
    data: { name: 'Mechanics' },
  });

  // 2. Create Technicians
  await prisma.user.create({
    data: {
      name: 'Alice (IT)',
      email: 'alice@gearguard.com',
      role: 'TECHNICIAN',
      teamId: teamIT.id,
    },
  });
  
  await prisma.user.create({
    data: {
      name: 'Bob (Mech)',
      email: 'bob@gearguard.com',
      role: 'TECHNICIAN',
      teamId: teamMech.id,
    },
  });

  console.log('Database seeded with Teams and Users!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });