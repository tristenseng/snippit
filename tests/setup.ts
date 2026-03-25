import { PrismaClient } from '@prisma/client'

// Mock Prisma client
const prismaMock = {
  user: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  location: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
  strain: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
  batch: { findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  batchStrain: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn() },
  day: { findUnique: jest.fn(), findMany: jest.fn(), findFirst: jest.fn(), create: jest.fn(), update: jest.fn() },
  employeeDay: { findUnique: jest.fn(), findMany: jest.fn(), create: jest.fn(), update: jest.fn(), delete: jest.fn() },
  userLocation: { findMany: jest.fn(), create: jest.fn(), deleteMany: jest.fn() },
  $transaction: jest.fn((fn: any) => fn(prismaMock)),
} as unknown as PrismaClient

jest.mock('@/lib/prisma', () => ({ prisma: prismaMock }))

// Mock next-auth session
const mockSession = {
  user: { id: 'test-user-id', email: 'manager@test.com', name: 'Test Manager', role: 'MANAGER', activeRole: 'MANAGER' },
  expires: new Date(Date.now() + 86400000).toISOString(),
}

jest.mock('next-auth', () => ({
  getServerSession: jest.fn(() => Promise.resolve(mockSession)),
}))

export { prismaMock, mockSession }
