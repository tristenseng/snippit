import { prismaMock } from '../setup'
import { getServerSession } from 'next-auth'

// Mock auth module to avoid loading @auth/prisma-adapter (ESM)
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

let GET_ENTRIES: (req: Request, ctx: { params: { id: string; dayId: string } }) => Promise<Response>
let POST_ENTRIES: (req: Request, ctx: { params: { id: string; dayId: string } }) => Promise<Response>
let PATCH_ENTRY: (req: Request, ctx: { params: { id: string; dayId: string; entryId: string } }) => Promise<Response>
let DELETE_ENTRY: (req: Request, ctx: { params: { id: string; dayId: string; entryId: string } }) => Promise<Response>

beforeAll(async () => {
  const entriesMod = await import('@/app/api/batches/[id]/days/[dayId]/entries/route')
  GET_ENTRIES = entriesMod.GET
  POST_ENTRIES = entriesMod.POST

  const entryMod = await import('@/app/api/batches/[id]/days/[dayId]/entries/[entryId]/route')
  PATCH_ENTRY = entryMod.PATCH
  DELETE_ENTRY = entryMod.DELETE
})

const mockManagerSession = {
  user: { id: 'test-user-id', email: 'manager@test.com', name: 'Test Manager', role: 'MANAGER', activeRole: 'MANAGER' },
  expires: new Date(Date.now() + 86400000).toISOString(),
}

const mockDay = { id: 'day-1', batchId: 'batch-1', batchDay: 1, isSubmitted: false }
const mockManagerUser = { locationId: 'loc-1' }
const mockBatch = { id: 'batch-1', locationId: 'loc-1', status: 'ACTIVE' }
const mockBatchStrain = { id: 'strain-1', batchId: 'batch-1', strainId: 'strain-a' }
const mockEntry = {
  id: 'entry-1',
  employeeId: 'emp-1',
  dayId: 'day-1',
  batchStrainId: 'strain-1',
  amount: 100.5,
  hours: null,
}

describe('Weight Entry API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockManagerSession)
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockManagerUser)
    ;(prismaMock.day.findUnique as jest.Mock).mockResolvedValue(mockDay)
    ;(prismaMock.batch.findUnique as jest.Mock).mockResolvedValue(mockBatch)
    ;(prismaMock.batchStrain.findUnique as jest.Mock).mockResolvedValue(mockBatchStrain)
  })

  describe('GET /api/batches/[id]/days/[dayId]/entries', () => {
    it('returns 401 without session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries')
      const res = await GET_ENTRIES(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(401)
    })

    it('returns 403 without canManageBatches permission', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({
        ...mockManagerSession,
        user: { ...mockManagerSession.user, role: 'EMPLOYEE', activeRole: 'EMPLOYEE' },
      })
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries')
      const res = await GET_ENTRIES(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(403)
    })

    it('returns 404 if day does not belong to batch', async () => {
      ;(prismaMock.day.findUnique as jest.Mock).mockResolvedValue({ ...mockDay, batchId: 'other-batch' })
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries')
      const res = await GET_ENTRIES(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(404)
    })

    it('returns entries with employee name and strain name', async () => {
      const mockEntries = [
        {
          ...mockEntry,
          employee: { id: 'emp-1', name: 'Alice' },
          batchStrain: { id: 'strain-1', strain: { id: 'strain-a', name: 'Blue Dream' } },
        },
      ]
      ;(prismaMock.employeeDay.findMany as jest.Mock).mockResolvedValue(mockEntries)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries')
      const res = await GET_ENTRIES(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toHaveLength(1)
      expect(data[0].employee.name).toBe('Alice')
      expect(data[0].batchStrain.strain.name).toBe('Blue Dream')
    })
  })

  describe('POST /api/batches/[id]/days/[dayId]/entries', () => {
    it('returns 401 without session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries', {
        method: 'POST',
        body: JSON.stringify({ employeeId: 'emp-1', batchStrainId: 'strain-1', amount: 100 }),
      })
      const res = await POST_ENTRIES(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(401)
    })

    it('returns 403 without canManageBatches permission', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({
        ...mockManagerSession,
        user: { ...mockManagerSession.user, role: 'EMPLOYEE', activeRole: 'EMPLOYEE' },
      })
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries', {
        method: 'POST',
        body: JSON.stringify({ employeeId: 'emp-1', batchStrainId: 'strain-1', amount: 100 }),
      })
      const res = await POST_ENTRIES(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(403)
    })

    it('creates entry with valid data and returns 201', async () => {
      ;(prismaMock.batchStrain.findFirst as jest.Mock) = jest.fn().mockResolvedValue(mockBatchStrain)
      ;(prismaMock.employeeDay.create as jest.Mock).mockResolvedValue(mockEntry)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries', {
        method: 'POST',
        body: JSON.stringify({ employeeId: 'emp-1', batchStrainId: 'strain-1', amount: 100.5 }),
      })
      const res = await POST_ENTRIES(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data.amount).toBe(100.5)
    })

    it('returns 400 if amount <= 0', async () => {
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries', {
        method: 'POST',
        body: JSON.stringify({ employeeId: 'emp-1', batchStrainId: 'strain-1', amount: 0 }),
      })
      const res = await POST_ENTRIES(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(400)
    })

    it('returns 400 if amount > 9999.9', async () => {
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries', {
        method: 'POST',
        body: JSON.stringify({ employeeId: 'emp-1', batchStrainId: 'strain-1', amount: 10000 }),
      })
      const res = await POST_ENTRIES(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(400)
    })

    it('returns 400 if batchStrainId does not belong to batch', async () => {
      ;(prismaMock.batchStrain.findFirst as jest.Mock) = jest.fn().mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries', {
        method: 'POST',
        body: JSON.stringify({ employeeId: 'emp-1', batchStrainId: 'wrong-strain', amount: 100 }),
      })
      const res = await POST_ENTRIES(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('Strain does not belong to this batch')
    })
  })

  describe('PATCH /api/batches/[id]/days/[dayId]/entries/[entryId]', () => {
    beforeEach(() => {
      ;(prismaMock.employeeDay.findUnique as jest.Mock).mockResolvedValue(mockEntry)
    })

    it('returns 401 without session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries/entry-1', {
        method: 'PATCH',
        body: JSON.stringify({ amount: 200 }),
      })
      const res = await PATCH_ENTRY(req, { params: { id: 'batch-1', dayId: 'day-1', entryId: 'entry-1' } })
      expect(res.status).toBe(401)
    })

    it('returns 403 without canManageBatches permission', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({
        ...mockManagerSession,
        user: { ...mockManagerSession.user, role: 'EMPLOYEE', activeRole: 'EMPLOYEE' },
      })
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries/entry-1', {
        method: 'PATCH',
        body: JSON.stringify({ amount: 200 }),
      })
      const res = await PATCH_ENTRY(req, { params: { id: 'batch-1', dayId: 'day-1', entryId: 'entry-1' } })
      expect(res.status).toBe(403)
    })

    it('updates amount and returns 200', async () => {
      const updatedEntry = { ...mockEntry, amount: 200 }
      ;(prismaMock.employeeDay.update as jest.Mock).mockResolvedValue(updatedEntry)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries/entry-1', {
        method: 'PATCH',
        body: JSON.stringify({ amount: 200 }),
      })
      const res = await PATCH_ENTRY(req, { params: { id: 'batch-1', dayId: 'day-1', entryId: 'entry-1' } })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.amount).toBe(200)
    })

    it('returns 404 if entry does not belong to the day', async () => {
      ;(prismaMock.employeeDay.findUnique as jest.Mock).mockResolvedValue({ ...mockEntry, dayId: 'other-day' })
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries/entry-1', {
        method: 'PATCH',
        body: JSON.stringify({ amount: 200 }),
      })
      const res = await PATCH_ENTRY(req, { params: { id: 'batch-1', dayId: 'day-1', entryId: 'entry-1' } })
      expect(res.status).toBe(404)
    })
  })

  describe('DELETE /api/batches/[id]/days/[dayId]/entries/[entryId]', () => {
    beforeEach(() => {
      ;(prismaMock.employeeDay.findUnique as jest.Mock).mockResolvedValue(mockEntry)
    })

    it('returns 401 without session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries/entry-1', {
        method: 'DELETE',
      })
      const res = await DELETE_ENTRY(req, { params: { id: 'batch-1', dayId: 'day-1', entryId: 'entry-1' } })
      expect(res.status).toBe(401)
    })

    it('returns 403 without canManageBatches permission', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({
        ...mockManagerSession,
        user: { ...mockManagerSession.user, role: 'EMPLOYEE', activeRole: 'EMPLOYEE' },
      })
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries/entry-1', {
        method: 'DELETE',
      })
      const res = await DELETE_ENTRY(req, { params: { id: 'batch-1', dayId: 'day-1', entryId: 'entry-1' } })
      expect(res.status).toBe(403)
    })

    it('removes the entry and returns success', async () => {
      ;(prismaMock.employeeDay.delete as jest.Mock).mockResolvedValue(mockEntry)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries/entry-1', {
        method: 'DELETE',
      })
      const res = await DELETE_ENTRY(req, { params: { id: 'batch-1', dayId: 'day-1', entryId: 'entry-1' } })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.success).toBe(true)
    })

    it('returns 404 if entry not found', async () => {
      ;(prismaMock.employeeDay.findUnique as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/entries/entry-1', {
        method: 'DELETE',
      })
      const res = await DELETE_ENTRY(req, { params: { id: 'batch-1', dayId: 'day-1', entryId: 'entry-1' } })
      expect(res.status).toBe(404)
    })
  })
})
