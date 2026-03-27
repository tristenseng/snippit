import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')

describe('Next.js Foundation (01-01-01, 01-01-02)', () => {
  describe('AUTH-01 — required dependencies present in package.json', () => {
    let pkg: Record<string, unknown>

    beforeAll(() => {
      const raw = fs.readFileSync(path.join(ROOT, 'package.json'), 'utf-8')
      pkg = JSON.parse(raw)
    })

    const requiredDeps = [
      'next',
      'react',
      'next-auth',
      '@auth/prisma-adapter',
      '@prisma/client',
      'bcryptjs',
      'zod',
    ]

    it.each(requiredDeps)(
      'package.json has production dependency: %s',
      (dep) => {
        const deps = (pkg.dependencies ?? {}) as Record<string, string>
        expect(deps[dep]).toBeDefined()
      }
    )

    it('package.json has devDependency: typescript', () => {
      const devDeps = (pkg.devDependencies ?? {}) as Record<string, string>
      // typescript may be in either deps or devDeps
      const allDeps = {
        ...((pkg.dependencies ?? {}) as Record<string, string>),
        ...devDeps,
      }
      expect(allDeps['typescript']).toBeDefined()
    })

    it('package.json has tailwindcss', () => {
      const allDeps = {
        ...((pkg.dependencies ?? {}) as Record<string, string>),
        ...((pkg.devDependencies ?? {}) as Record<string, string>),
      }
      expect(allDeps['tailwindcss']).toBeDefined()
    })

    it('package.json has prisma', () => {
      const allDeps = {
        ...((pkg.dependencies ?? {}) as Record<string, string>),
        ...((pkg.devDependencies ?? {}) as Record<string, string>),
      }
      expect(allDeps['prisma']).toBeDefined()
    })
  })

  describe('UX-01 — required config files exist on disk', () => {
    const configFiles = [
      'next.config.js',
      'tsconfig.json',
      'postcss.config.js',
      'tailwind.config.js',
    ]

    it.each(configFiles)('file exists: %s', (filename) => {
      const filePath = path.join(ROOT, filename)
      expect(fs.existsSync(filePath)).toBe(true)
    })

    it('src/app/layout.tsx exists', () => {
      const filePath = path.join(ROOT, 'src', 'app', 'layout.tsx')
      expect(fs.existsSync(filePath)).toBe(true)
    })
  })
})
