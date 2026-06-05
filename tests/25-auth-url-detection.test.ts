describe('Better Auth URL Auto-Detection', () => {
  const originalEnv = { ...process.env }
  const originalPlatform = process.platform
  const originalArgv = [...process.argv]

  beforeEach(() => {
    jest.resetModules()
    process.env = { ...originalEnv }
  })

  afterAll(() => {
    process.env = originalEnv
    Object.defineProperty(process, 'platform', {
      value: originalPlatform
    })
    process.argv = originalArgv
  })

  it('should set BETTER_AUTH_URL to localhost:3015 if platform is darwin and argv has -p 3015', () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true
    })
    process.argv = ['node', 'next', 'start', '-p', '3015']
    
    require('../lib/auth-env')

    expect(process.env.BETTER_AUTH_URL).toBe('http://localhost:3015')
  })

  it('should set BETTER_AUTH_URL to localhost:3000 if platform is darwin and no port specified', () => {
    Object.defineProperty(process, 'platform', {
      value: 'darwin',
      configurable: true
    })
    process.argv = ['node', 'next', 'dev']

    require('../lib/auth-env')

    expect(process.env.BETTER_AUTH_URL).toBe('http://localhost:3000')
  })

  it('should NOT override BETTER_AUTH_URL if platform is linux (VPS)', () => {
    Object.defineProperty(process, 'platform', {
      value: 'linux',
      configurable: true
    })
    process.env.BETTER_AUTH_URL = 'https://bunq.h4ck3d.me'
    process.argv = ['node', 'next', 'start', '-p', '3015']

    require('../lib/auth-env')

    expect(process.env.BETTER_AUTH_URL).toBe('https://bunq.h4ck3d.me')
  })
})
