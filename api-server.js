import 'dotenv/config'
process.env.PORT = process.env.API_PORT || '3001'
await import('./server.js')
