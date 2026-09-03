import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash('3qhvFIAz@y', 12)

  await prisma.user.upsert({
    where: { email: 'abacus-7399cd75@example.com' },
    update: {},
    create: {
      email: 'abacus-7399cd75@example.com',
      name: 'Admin Test',
      password: hashedPassword,
      plan: 'pro',
      subscriptionStatus: 'active',
    },
  })

  console.log('Seed completed successfully')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
