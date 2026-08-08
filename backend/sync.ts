import sequelize from './src/utils/connection.ts'
import './src/models/index.ts'

// use this to sync database by deleting then creating new one with the latest database implementations
await sequelize.sync({ force: true })

// For safe migrations later, consider using alter instead of force
// await sequelize.sync({ alter: true })