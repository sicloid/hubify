import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding veritabanı başlatılıyor...');

  const passwordHash = await bcrypt.hash('Hubify123!', 10);

  const users = [
    { email: 'admin@hubify.test', fullName: 'Sistem Yöneticisi', role: UserRole.ADMIN },
    { email: 'ihracatci@hubify.test', fullName: 'Ayşe İhracat', role: UserRole.EXPORTER },
    { email: 'lojistik@hubify.test', fullName: 'Bora Lojistik', role: UserRole.LOGISTICS },
    { email: 'icc-uzmani@hubify.test', fullName: 'Hakan Uzman', role: UserRole.ICC_EXPERT },
    { email: 'mali-musavir@hubify.test', fullName: 'Cemal Müşavir', role: UserRole.FINANCIAL_ADV },
    { email: 'sigorta@hubify.test', fullName: 'Efe Sigorta', role: UserRole.INSURER }
  ];

  for (const user of users) {
    const existingUser = await prisma.user.findUnique({ where: { email: user.email } });
    
    if (!existingUser) {
      await prisma.user.create({
        data: {
          email: user.email,
          fullName: user.fullName,
          role: user.role,
          passwordHash: passwordHash,
        },
      });
      console.log(`Eklendi: ${user.email} (${user.role})`);
    } else {
      console.log(`Zaten var: ${user.email}`);
    }
  }

  console.log('Seeding işlemi başarıyla tamamlandı.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
