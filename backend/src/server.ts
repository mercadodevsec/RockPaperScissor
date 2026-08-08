import 'dotenv/config'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import cors from 'cors'
import express from 'express'
import { parse } from 'yaml'
import swaggerUi from 'swagger-ui-express'
import gameRoutes from './routes/gameRoutes.ts'
import authRoutes from './routes/authRoutes.ts'
import playerRoutes from './routes/playerRoutes.ts'
import './models/index.ts'

const app = express()
const PORT = Number(process.env.PORT ?? 3000)
const swaggerDocument = parse(readFileSync(resolve(process.cwd(), './src/swagger/swagger.yml'), 'utf8'))

app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.use('/api/auth', authRoutes)
app.use('/api/game', gameRoutes)
app.use('/api/players', playerRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`)
})
