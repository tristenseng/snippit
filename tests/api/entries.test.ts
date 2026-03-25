import { prismaMock } from '../setup'

describe('Weight Entry API', () => {
  beforeEach(() => jest.clearAllMocks())

  describe('POST /api/batches/[id]/days/[dayId]/entries', () => {
    it('should be implemented', () => {
      expect(true).toBe(true) // stub — replaced when entry routes are built in Plan 03
    })
  })

  describe('PATCH /api/batches/[id]/days/[dayId]/entries/[entryId]', () => {
    it('should be implemented', () => {
      expect(true).toBe(true)
    })
  })

  describe('DELETE /api/batches/[id]/days/[dayId]/entries/[entryId]', () => {
    it('should be implemented', () => {
      expect(true).toBe(true)
    })
  })
})
