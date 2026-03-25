import { prismaMock } from '../setup'
import { getServerSession } from 'next-auth'

// Mock auth module to avoid loading @auth/prisma-adapter (ESM)
jest.mock('@/lib/auth', () => ({
  authOptions: {},
}))

let GET_SEARCH: (req: Request) => Promise<Response>

beforeAll(async () => {
  const mod = await import('@/app/api/employees/search/route')
  GET_SEARCH = mod.GET
})

const mockManagerSession = {
  user: { id: 'test-user-id', email: 'manager@test.com', name: 'Test Manager', role: 'MANAGER', activeRole: 'MANAGER' },
  expires: new Date(Date.now() + 86400000).toISOString(),
}

const mockEmployees = [
  { id: 'emp-1', name: 'Alice' },
  { id: 'emp-2', name: 'Bob' },
]

describe('Employee Search API', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(getServerSession as jest.Mock).mockResolvedValue(mockManagerSession)
  })

  describe('GET /api/employees/search', () => {
    it('returns 401 without session', async () => {
      ;(getServerSession as jest.Mock).mockResolvedValue(null)
      const req = new Request('http://localhost/api/employees/search?locationId=loc-1')
      const res = await GET_SEARCH(req)
      expect(res.status).toBe(401)
    })

    it('returns 400 when locationId is missing', async () => {
      const req = new Request('http://localhost/api/employees/search')
      const res = await GET_SEARCH(req)
      expect(res.status).toBe(400)
    })

    it('returns active employees at location ordered by name', async () => {
      ;(prismaMock.user.findMany as jest.Mock).mockResolvedValue(mockEmployees)
      const req = new Request('http://localhost/api/employees/search?locationId=loc-1')
      const res = await GET_SEARCH(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toHaveLength(2)
      expect(data[0].name).toBe('Alice')
      expect(data[1].name).toBe('Bob')
    })

    it('excludes deactivated employees (deactivatedAt: null filter)', async () => {
      ;(prismaMock.user.findMany as jest.Mock).mockResolvedValue(mockEmployees)
      const req = new Request('http://localhost/api/employees/search?locationId=loc-1')
      await GET_SEARCH(req)
      const callArgs = (prismaMock.user.findMany as jest.Mock).mock.calls[0][0]
      expect(callArgs.where.deactivatedAt).toBeNull()
    })

    it('filters employees by locationId via userLocations join', async () => {
      ;(prismaMock.user.findMany as jest.Mock).mockResolvedValue(mockEmployees)
      const req = new Request('http://localhost/api/employees/search?locationId=loc-1')
      await GET_SEARCH(req)
      const callArgs = (prismaMock.user.findMany as jest.Mock).mock.calls[0][0]
      expect(callArgs.where.userLocations).toEqual({ some: { locationId: 'loc-1' } })
    })

    it('filters employees by EMPLOYEE role', async () => {
      ;(prismaMock.user.findMany as jest.Mock).mockResolvedValue(mockEmployees)
      const req = new Request('http://localhost/api/employees/search?locationId=loc-1')
      await GET_SEARCH(req)
      const callArgs = (prismaMock.user.findMany as jest.Mock).mock.calls[0][0]
      expect(callArgs.where.role).toBe('EMPLOYEE')
    })

    it('returns only id and name fields', async () => {
      ;(prismaMock.user.findMany as jest.Mock).mockResolvedValue(mockEmployees)
      const req = new Request('http://localhost/api/employees/search?locationId=loc-1')
      await GET_SEARCH(req)
      const callArgs = (prismaMock.user.findMany as jest.Mock).mock.calls[0][0]
      expect(callArgs.select).toEqual({ id: true, name: true })
    })

    it('returns empty array when no employees found', async () => {
      ;(prismaMock.user.findMany as jest.Mock).mockResolvedValue([])
      const req = new Request('http://localhost/api/employees/search?locationId=loc-1')
      const res = await GET_SEARCH(req)
      expect(res.status).toBe(200)
      const data = await res.json()
      expect(data).toHaveLength(0)
    })
  })
})
