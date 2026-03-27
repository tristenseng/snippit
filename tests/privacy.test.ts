import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')

describe('Middleware and Privacy Configuration (01-03-03)', () => {
  describe('AUTH-04 / UX-02 — middleware matcher covers protected routes', () => {
    // Read middleware source directly — config is a static export
    let middlewareSource: string

    beforeAll(() => {
      middlewareSource = fs.readFileSync(
        path.join(ROOT, 'src', 'middleware.ts'),
        'utf-8'
      )
    })

    it('middleware config is exported from src/middleware.ts', () => {
      expect(middlewareSource).toContain('export const config')
    })

    it('matcher includes /dashboard routes', () => {
      expect(middlewareSource).toMatch(/\/dashboard/)
    })

    it('matcher includes /admin routes', () => {
      expect(middlewareSource).toMatch(/\/admin/)
    })

    it('matcher includes /batches routes', () => {
      expect(middlewareSource).toMatch(/\/batches/)
    })

    it('middleware uses withAuth for route protection', () => {
      expect(middlewareSource).toContain('withAuth')
    })
  })

  describe('AUTH-04 / UX-02 — RLS policy file exists', () => {
    it('prisma/rls-policies.sql file exists on disk', () => {
      const rlsPath = path.join(ROOT, 'prisma', 'rls-policies.sql')
      expect(fs.existsSync(rlsPath)).toBe(true)
    })

    it('rls-policies.sql contains Row Level Security policy definitions', () => {
      const rlsPath = path.join(ROOT, 'prisma', 'rls-policies.sql')
      const content = fs.readFileSync(rlsPath, 'utf-8')
      // Must contain RLS policy creation
      expect(content.toUpperCase()).toMatch(/CREATE POLICY|ROW LEVEL SECURITY|ENABLE ROW LEVEL/)
    })
  })
})
