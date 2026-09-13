import { PrismaClient } from '@prisma/client';
import { challengeData } from '../lib/challenge-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding challenges...');

  for (const challenge of challengeData) {
    // Check if challenge already exists
    const existing = await prisma.challenge.findFirst({
      where: { title: challenge.title }
    });

    if (!existing) {
      await prisma.challenge.create({
        data: {
          title: challenge.title,
          difficulty: challenge.difficulty,
          concepts: challenge.concepts,
          description: challenge.description,
          instructions: challenge.instructions,
          starterCode: challenge.starterCode,
          sampleSolution: challenge.sampleSolution,
          topic: challenge.topic,
        }
      });
      console.log(`Created challenge: ${challenge.title}`);
    } else {
      console.log(`Challenge already exists: ${challenge.title}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
