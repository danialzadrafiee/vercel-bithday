import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const danial = await prisma.user.create({
    data: {
      telegramId: 7506209879n, 
      username: 'dante',
      firstName: 'danial',
      lastName: 'rafiee',
      languageCode: 'en', 
      birthYear: 1377, 
      birthMonth: 1,
      birthDay: 24,
      notificationDays: 3, //default value
      points: 0, // default value
      registrationStep: null, // Or a suitable initial step, e.g., 'WELCOME'
    },
  });

  console.log('Created user:', danial);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
