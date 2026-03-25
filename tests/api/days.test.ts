import { prismaMock } from '../setup'
import { getServerSession } from 'next-auth'

// Mock auth module to avoid loading @auth/prisma-adapter (ESM)
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

let GET_DAYS: (req: Request, ctx: { params: { id: string } }) => Promise<Response>
let POST_DAYS: (req: Request, ctx: { params: { id: string } }) => Promise<Response>
let POST_SUBMIT: (req: Request, ctx: { params: { id: string; dayId: string } }) => Promise<Response>

beforeAll(async () => {
  const daysMod = await import('@/app/api/batches/[id]/days/route')
  GET_DAYS = daysMod.GET
  POST_DAYS = daysMod.POST

  const submitMod = await import('@/app/api/batches/[id]/days/[dayId]/submit/route')
  POST_SUBMIT = submitMod.POST
})

const mockManagerSession = {
  user: { id: 'test-user-id', email: 'manager@test.com', name: 'Test Manager', role: 'MANAGER', activeRole: 'MANAGER' },
  expires: new Date(Date.now() + 86400000).toISOString(),
}

const mockActiveBatch = {
  id: 'batch-1',
  locationId: 'loc-1',
  number: 1,
  status: 'ACTIVE',
}

const mockManagerUser = { locationId: 'loc-1' }

describe('Day API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockManagerSession)
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockManagerUser)
    ;(prismaMock.batch.findUnique as jest.Mock).mockResolvedValue(mockActiveBatch)
  })

  describe('GET /api/batches/[id]/days', () => {
    it('returns 401 without session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches/batch-1/days')
      const res = await GET_DAYS(req, { params: { id: 'batch-1' } })
      expect(res.status).toBe(401)
    })

    it('returns 404 if batch not found', async () => {
      ;(prismaMock.batch.findUnique as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches/nonexistent/days')
      const res = await GET_DAYS(req, { params: { id: 'nonexistent' } })
      expect(res.status).toBe(404)
    })

    it('returns days for batch ordered by batchDay', async () => {
      const mockDays = [
        { id: 'day-1', batchId: 'batch-1', batchDay: 1, isSubmitted: false, _count: { employeeDays: 0 } },
        { id: 'day-2', batchId: 'batch-1', batchDay: 2, isSubmitted: false, _count: { employeeDays: 0 } },
      ]
      ;(prismaMock.day.findMany as jest.Mock).mockResolvedValue(mockDays)
      const req = new Request('http://localhost/api/batches/batch-1/days')
      const res = await GET_DAYS(req, { params: { id: 'batch-1' } })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toHaveLength(2)
    })
  })

  describe('POST /api/batches/[id]/days', () => {
    it('returns 401 without session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches/batch-1/days', { method: 'POST', body: '{}' })
      const res = await POST_DAYS(req, { params: { id: 'batch-1' } })
      expect(res.status).toBe(401)
    })

    it('returns 404 if batch not found or not at manager location', async () => {
      ;(prismaMock.batch.findUnique as jest.Mock).mockResolvedValue({
        ...mockActiveBatch,
        locationId: 'other-loc',
      })
      const req = new Request('http://localhost/api/batches/batch-1/days', { method: 'POST', body: '{}' })
      const res = await POST_DAYS(req, { params: { id: 'batch-1' } })
      expect(res.status).toBe(404)
    })

    it('returns 400 if batch is not ACTIVE', async () => {
      ;(prismaMock.batch.findUnique as jest.Mock).mockResolvedValue({
        ...mockActiveBatch,
        status: 'INACTIVE',
      })
      const req = new Request('http://localhost/api/batches/batch-1/days', { method: 'POST', body: '{}' })
      const res = await POST_DAYS(req, { params: { id: 'batch-1' } })
      expect(res.status).toBe(400)
      const data = await res.json()
      expect(data.error).toContain('active')
    })

    it('creates day with auto-incremented batchDay (first = 1)', async () => {
      ;(prismaMock.day.findFirst as jest.Mock).mockResolvedValue(null) // no existing days
      const mockDay = { id: 'day-1', batchId: 'batch-1', batchDay: 1, isSubmitted: false }
      ;(prismaMock.day.create as jest.Mock).mockResolvedValue(mockDay)
      const req = new Request('http://localhost/api/batches/batch-1/days', { method: 'POST', body: '{}' })
      const res = await POST_DAYS(req, { params: { id: 'batch-1' } })
      expect(res.status).toBe(201)
      const createCall = (prismaMock.day.create as jest.Mock).mock.calls[0][0]
      expect(createCall.data.batchDay).toBe(1)
    })

    it('auto-increments batchDay (next = 2 when last day has batchDay = 1)', async () => {
      ;(prismaMock.day.findFirst as jest.Mock).mockResolvedValue({ batchDay: 1 })
      const mockDay = { id: 'day-2', batchId: 'batch-1', batchDay: 2, isSubmitted: false }
      ;(prismaMock.day.create as jest.Mock).mockResolvedValue(mockDay)
      const req = new Request('http://localhost/api/batches/batch-1/days', { method: 'POST', body: '{}' })
      const res = await POST_DAYS(req, { params: { id: 'batch-1' } })
      expect(res.status).toBe(201)
      const createCall = (prismaMock.day.create as jest.Mock).mock.calls[0][0]
      expect(createCall.data.batchDay).toBe(2)
    })
  })

  describe('POST /api/batches/[id]/days/[dayId]/submit', () => {
    const mockDay = { id: 'day-1', batchId: 'batch-1', batchDay: 1, isSubmitted: false }

    beforeEach(() => {
      ;(prismaMock.day.findUnique as jest.Mock).mockResolvedValue(mockDay)
    })

    it('returns 401 without session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/submit', { method: 'POST' })
      const res = await POST_SUBMIT(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(401)
    })

    it('returns 404 if day not found', async () => {
      ;(prismaMock.day.findUnique as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches/batch-1/days/nonexistent/submit', { method: 'POST' })
      const res = await POST_SUBMIT(req, { params: { id: 'batch-1', dayId: 'nonexistent' } })
      expect(res.status).toBe(404)
    })

    it('sets isSubmitted=true and returns updated day', async () => {
      const submittedDay = { ...mockDay, isSubmitted: true }
      ;(prismaMock.day.update as jest.Mock).mockResolvedValue(submittedDay)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/submit', { method: 'POST' })
      const res = await POST_SUBMIT(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data.isSubmitted).toBe(true)
    })

    it('succeeds on already-submitted day (idempotent)', async () => {
      const alreadySubmitted = { ...mockDay, isSubmitted: true }
      ;(prismaMock.day.findUnique as jest.Mock).mockResolvedValue(alreadySubmitted)
      ;(prismaMock.day.update as jest.Mock).mockResolvedValue(alreadySubmitted)
      const req = new Request('http://localhost/api/batches/batch-1/days/day-1/submit', { method: 'POST' })
      const res = await POST_SUBMIT(req, { params: { id: 'batch-1', dayId: 'day-1' } })
      expect(res.status).toBe(200)
    })
  })
})
