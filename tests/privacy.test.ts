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

    it('matcher includes /api/admin routes', () => {
      expect(middlewareSource).toMatch(/\/api\/admin/)
    })

    it('matcher includes /api/strains routes', () => {
      expect(middlewareSource).toMatch(/\/api\/strains/)
    })

    it('matcher includes /api/employees routes', () => {
      expect(middlewareSource).toMatch(/\/api\/employees/)
    })

    it('matcher does not include dead /api/protected pattern', () => {
      expect(middlewareSource).not.toMatch(/\/api\/protected/)
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

describe('AUTH-02 — LoginForm deactivated error message', () => {
  // LoginForm is a client component; source scan verifies the deactivated-account
  // branch and user-facing message are present without requiring a DOM environment.
  let loginFormSource: string

  beforeAll(() => {
    loginFormSource = fs.readFileSync(
      path.join(ROOT, 'src', 'components', 'auth', 'LoginForm.tsx'),
      'utf-8'
    )
  })

  it('LoginForm checks for AccountDeactivated error type', () => {
    expect(loginFormSource).toContain('AccountDeactivated')
  })

  it('LoginForm shows distinct user-facing message for deactivated accounts', () => {
    expect(loginFormSource).toContain('This account has been deactivated')
  })
})
