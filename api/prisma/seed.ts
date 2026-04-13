import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hash = (pwd: string) => bcrypt.hash(pwd, 10);

  // Admin
  const adminExists = await prisma.user.findFirst({ where: { role: 'ADMIN' } });
  if (!adminExists) {
    await prisma.user.create({
      data: {
        name: 'Admin Washapp',
        email: 'admin@washapp.ci',
        phone: '+22500000000',
        role: 'ADMIN',
        passwordHash: await hash('Admin2024!'),
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
      },
    });
    console.log('Admin created: admin@washapp.ci / Admin2024!');
  } else {
    console.log('Admin already exists');
  }

  // Client test
  const clientExists = await prisma.user.findFirst({ where: { email: 'client@test.ci' } });
  if (!clientExists) {
    const clientUser = await prisma.user.create({
      data: {
        name: 'Lohrans Test',
        email: 'client@test.ci',
        phone: '+22501000001',
        role: 'CLIENT',
        passwordHash: await hash('Client2024!'),
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        clientProfile: {
          create: {
            defaultPaymentMethod: 'ORANGE_MONEY',
          },
        },
      },
    });
    console.log('Client created: client@test.ci / Client2024!');
  } else {
    console.log('Client already exists');
  }

  // Washer test
  const washerExists = await prisma.user.findFirst({ where: { email: 'washer@test.ci' } });
  if (!washerExists) {
    await prisma.user.create({
      data: {
        name: 'Kofi Washer',
        email: 'washer@test.ci',
        phone: '+22502000002',
        role: 'WASHER',
        passwordHash: await hash('Washer2024!'),
        isEmailVerified: true,
        isPhoneVerified: true,
        isActive: true,
        washerProfile: {
          create: {
            transportType: 'MOTORBIKE',
            zoneLabel: 'Cocody',
            averageRating: 4.8,
            isOnline: false,
            accountStatus: 'ACTIVE',
            subscriptionStatus: 'ACTIVE',
            trainingValidated: true,
            testValidated: true,
            equipmentValidated: true,
          },
        },
      },
    });
    console.log('Washer created: washer@test.ci / Washer2024!');
  } else {
    console.log('Washer already exists');
  }

  console.log('\nSeed termine !');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());