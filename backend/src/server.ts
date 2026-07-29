import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { parse } from 'yaml'
import swaggerUi from 'swagger-ui-express'
import gameRoutes from './routes/gameRoutes.ts'



dotenv.config()

const app = express();
const PORT = process.env.PORT || 3000
const swaggerDocument = parse(readFileSync(resolve(process.cwd(), './src/swagger/swagger.yml'), 'utf8'))

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routers
app.use('/api/game', gameRoutes)
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Swagger docs available at http://localhost:${PORT}/api-docs`)
})
