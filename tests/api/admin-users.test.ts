import { prismaMock } from '../setup'

describe('Admin Users API', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('POST /api/admin/users', () => {
    it('should be implemented', () => {
      expect(true).toBe(true)
    })
  })

  describe('POST /api/admin/users/[id]/deactivate', () => {
    it('should be implemented', () => {
      expect(true).toBe(true)
    })
  })
})
