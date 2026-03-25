import { prismaMock } from '../setup'
import { getServerSession } from 'next-auth'

// Mock auth module to avoid loading @auth/prisma-adapter (ESM)
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

// Re-import route handlers after mocks are established
let GET: () => Promise<Response>
let POST: (req: Request) => Promise<Response>

beforeAll(async () => {
  const mod = await import('@/app/api/batches/route')
  GET = mod.GET
  POST = mod.POST
})

const mockManagerSession = {
  user: { id: 'test-user-id', email: 'manager@test.com', name: 'Test Manager', role: 'MANAGER', activeRole: 'MANAGER' },
  expires: new Date(Date.now() + 86400000).toISOString(),
}

const mockManagerUser = { locationId: 'loc-1' }

describe('Batch API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockManagerSession)
    ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue(mockManagerUser)
  })

  describe('GET /api/batches', () => {
    it('returns 401 when no session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      const res = await GET()
      expect(res.status).toBe(401)
    })

    it('returns 403 for EMPLOYEE role', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({
        ...mockManagerSession,
        user: { ...mockManagerSession.user, role: 'EMPLOYEE', activeRole: 'EMPLOYEE' },
      })
      const res = await GET()
      expect(res.status).toBe(403)
    })

    it('returns batches for manager location', async () => {
      const mockBatches = [
        {
          id: 'batch-1',
          locationId: 'loc-1',
          number: 1,
          status: 'ACTIVE',
          batchStrains: [],
          days: [],
        },
      ]
      ;(prismaMock.batch.findMany as jest.Mock).mockResolvedValue(mockBatches)
      const res = await GET()
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(Array.isArray(data)).toBe(true)
    })
  })

  describe('POST /api/batches', () => {
    it('returns 401 without session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/batches', {
        method: 'POST',
        body: JSON.stringify({ strainIds: ['strain-1'] }),
      })
      const res = await POST(req)
      expect(res.status).toBe(401)
    })

    it('returns 403 for EMPLOYEE role', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue({
        ...mockManagerSession,
        user: { ...mockManagerSession.user, role: 'EMPLOYEE', activeRole: 'EMPLOYEE' },
      })
      const req = new Request('http://localhost/api/batches', {
        method: 'POST',
        body: JSON.stringify({ strainIds: ['strain-1'] }),
      })
      const res = await POST(req)
      expect(res.status).toBe(403)
    })

    it('returns 400 when strainIds is empty', async () => {
      const req = new Request('http://localhost/api/batches', {
        method: 'POST',
        body: JSON.stringify({ strainIds: [] }),
      })
      const res = await POST(req)
      expect(res.status).toBe(400)
    })

    it('returns 409 when ACTIVE batch already exists at location', async () => {
      ;(prismaMock.batch.findFirst as jest.Mock).mockResolvedValue({
        id: 'existing-batch',
        status: 'ACTIVE',
      })
      const req = new Request('http://localhost/api/batches', {
        method: 'POST',
        body: JSON.stringify({ strainIds: ['strain-1'] }),
      })
      const res = await POST(req)
      expect(res.status).toBe(409)
    })

    it('creates batch with auto-incremented number (first = 1)', async () => {
      ;(prismaMock.batch.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // no active batch
        .mockResolvedValueOnce(null) // no previous batch → nextNumber = 1
      const mockBatch = {
        id: 'new-batch',
        locationId: 'loc-1',
        number: 1,
        status: 'INACTIVE',
        batchStrains: [{ id: 'bs-1', strainId: 'strain-1', strain: { id: 'strain-1', name: 'OG Kush' } }],
      }
      ;(prismaMock.batch.create as jest.Mock).mockResolvedValue(mockBatch)
      const req = new Request('http://localhost/api/batches', {
        method: 'POST',
        body: JSON.stringify({ strainIds: ['strain-1'] }),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
      const data = await res.json()
      expect(data.number).toBe(1)
    })

    it('auto-increments batch number (next = 2 when last = 1)', async () => {
      ;(prismaMock.batch.findFirst as jest.Mock)
        .mockResolvedValueOnce(null) // no active batch
        .mockResolvedValueOnce({ number: 1 }) // last batch number = 1
      const mockBatch = {
        id: 'new-batch-2',
        locationId: 'loc-1',
        number: 2,
        status: 'INACTIVE',
        batchStrains: [],
      }
      ;(prismaMock.batch.create as jest.Mock).mockResolvedValue(mockBatch)
      const req = new Request('http://localhost/api/batches', {
        method: 'POST',
        body: JSON.stringify({ strainIds: ['strain-1'] }),
      })
      const res = await POST(req)
      expect(res.status).toBe(201)
      const createCall = (prismaMock.batch.create as jest.Mock).mock.calls[0][0]
      expect(createCall.data.number).toBe(2)
    })

    it('returns 422 when manager has no location', async () => {
      ;(prismaMock.user.findUnique as jest.Mock).mockResolvedValue({ locationId: null })
      const req = new Request('http://localhost/api/batches', {
        method: 'POST',
        body: JSON.stringify({ strainIds: ['strain-1'] }),
      })
      const res = await POST(req)
      expect(res.status).toBe(422)
    })
  })
})
