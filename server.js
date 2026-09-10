import 'dotenv/config'
import { createApp } from './server/app.js'
const { app, close } = createApp()
const server = app.listen(
  Number(process.env.PORT || 3000),
  process.env.HOST || '127.0.0.1',
  () => {
    console.log(`Tri-Core server listening on port ${server.address().port}`)
  },
)
for (const signal of ['SIGINT', 'SIGTERM'])
  process.on(signal, () =>
    server.close(() => {
      close()
      process.exit(0)
    }),
  )
