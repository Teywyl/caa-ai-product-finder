import { createApp } from './src/app.js'
import { pool } from './db/pool.js'

const app = createApp({ db: pool })
const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`CAA API listening on http://localhost:${port}`)
})
