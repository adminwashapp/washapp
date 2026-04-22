import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function resetAdminPassword() {
  const adminEmail = 'adminwashapp@gmail.com';
  const newPassword = 'Admin123!';
  
  const passwordHash = await bcrypt.hash(newPassword, 10);
  
  const admin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });
  
  if (admin) {
    await prisma.user.update({
      where: { email: adminEmail },
      data: { passwordHash },
    });
    console.log(`Mot de passe admin (${adminEmail}) reinitialise: ${newPassword}`);
  } else {
    console.log('Admin non trouve avec cet email');
  }
}

resetAdminPassword().finally(() => prisma.$disconnect());