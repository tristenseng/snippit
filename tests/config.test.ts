import * as fs from 'fs'
import * as path from 'path'

const ROOT = path.resolve(__dirname, '..')

describe('Tailwind CSS Configuration (01-01-02)', () => {
  let tailwindConfig: Record<string, unknown>

  beforeAll(() => {
    // Load the actual tailwind.config.js from disk
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    tailwindConfig = require(path.join(ROOT, 'tailwind.config.js'))
  })

  describe('AUTH-01 / UX-01 — mobile-first Tailwind setup', () => {
    it('content glob includes src/**', () => {
      const content = tailwindConfig.content as string[]
      expect(Array.isArray(content)).toBe(true)
      const hasSrcGlob = content.some((glob: string) => glob.startsWith('./src/') || glob.startsWith('src/'))
      expect(hasSrcGlob).toBe(true)
    })

    it('xs breakpoint is 320px', () => {
      const theme = tailwindConfig.theme as Record<string, unknown>
      const extend = theme?.extend as Record<string, unknown> | undefined
      const screens = extend?.screens as Record<string, string> | undefined
      expect(screens?.xs).toBe('320px')
    })

    it('minHeight touch is 44px', () => {
      const theme = tailwindConfig.theme as Record<string, unknown>
      const extend = theme?.extend as Record<string, unknown> | undefined
      const minHeight = extend?.minHeight as Record<string, string> | undefined
      expect(minHeight?.touch).toBe('44px')
    })
  })
})
