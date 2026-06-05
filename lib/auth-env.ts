// Dynamically set BETTER_AUTH_URL on local development machine (darwin) to match local port
export function initAuthEnv() {
  if (process.platform === 'darwin' && !process.env.BETTER_AUTH_URL) {
    let localPort = '4444' // default port — must match package.json scripts
    if (process.argv.includes('-p')) {
      const pIndex = process.argv.indexOf('-p')
      if (pIndex !== -1 && process.argv[pIndex + 1]) {
        localPort = process.argv[pIndex + 1]
      }
    } else if (process.argv.includes('--port')) {
      const pIndex = process.argv.indexOf('--port')
      if (pIndex !== -1 && process.argv[pIndex + 1]) {
        localPort = process.argv[pIndex + 1]
      }
    }
    process.env.BETTER_AUTH_URL = `http://localhost:${localPort}`
  }
}

// Automatically execute on import
initAuthEnv()
