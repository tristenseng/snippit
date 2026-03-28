import { PrismaClient, Prisma } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

type TxClient = Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'>

/** Run `fn` inside a transaction with app.current_user_id set for RLS. */
export async function withUser<T>(userId: string, fn: (tx: TxClient) => Promise<T>): Promise<T> {
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
    return fn(tx)
  })
}

/** Set app.current_user_id inside an already-open transaction for RLS. */
export async function setUserContext(tx: TxClient, userId: string): Promise<void> {
  await (tx as Prisma.TransactionClient).$executeRaw`SELECT set_config('app.current_user_id', ${userId}, true)`
}
