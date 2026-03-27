import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')

// Mock ESM-problematic packages before any imports that trigger them
jest.mock('next-auth/providers/credentials', () => {
  return jest.fn(() => ({ id: 'credentials', name: 'credentials', type: 'credentials' }))
})

jest.mock('@auth/prisma-adapter', () => ({
  PrismaAdapter: jest.fn(() => ({})),
}))

// @/lib/prisma is already mocked by setup.ts (prismaMock)
// next-auth is already mocked by setup.ts

describe('Auth Configuration (01-02-01)', () => {
  describe('AUTH-02 / AUTH-03 — authOptions config shape', () => {
    let authOptions: import('next-auth').NextAuthOptions

    beforeAll(async () => {
      const mod = await import('@/lib/auth')
      authOptions = mod.authOptions
    })

    it('session strategy is jwt', () => {
      expect(authOptions.session?.strategy).toBe('jwt')
    })

    it('session maxAge is 28800 (8 hours)', () => {
      expect(authOptions.session?.maxAge).toBe(8 * 60 * 60)
    })

    it('pages.signIn is /login', () => {
      expect(authOptions.pages?.signIn).toBe('/login')
    })

    it('has at least one provider (CredentialsProvider)', () => {
      expect(Array.isArray(authOptions.providers)).toBe(true)
      expect(authOptions.providers.length).toBeGreaterThan(0)
    })

    it('provider type is credentials', () => {
      const provider = authOptions.providers[0] as Record<string, unknown>
      expect(provider.type).toBe('credentials')
    })
  })

  describe('AUTH-02 — auth() helper is exported and callable', () => {
    it('auth is exported from @/lib/auth as a function', async () => {
      const mod = await import('@/lib/auth')
      expect(typeof mod.auth).toBe('function')
    })

    it('auth() returns a promise (is async-compatible)', async () => {
      const mod = await import('@/lib/auth')
      const result = mod.auth()
      expect(result).toBeInstanceOf(Promise)
      // Resolve to avoid unhandled promise rejection
      await result.catch(() => undefined)
    })
  })

  describe('AUTH-02 — Prisma singleton exists at @/lib/prisma', () => {
    it('prisma singleton file exists on disk', () => {
      const prismaPath = path.join(ROOT, 'src', 'lib', 'prisma.ts')
      expect(fs.existsSync(prismaPath)).toBe(true)
    })

    it('@/lib/prisma exports a prisma property', async () => {
      const mod = await import('@/lib/prisma')
      expect(mod.prisma).toBeDefined()
    })
  })
})
