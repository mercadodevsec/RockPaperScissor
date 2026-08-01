import GameModel from './src/models/Game.ts'


// use this to sync database by deleting then creating new one with the latest database implementations
GameModel.sync({force: true})

// GameModel.sync({alter: true})