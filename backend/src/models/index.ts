import Player from './Player.ts'
import Game from './Game.ts'
import Round from './Round.ts'

Player.hasMany(Game, {
  foreignKey: 'playerId',
  as: 'games',
})

Game.belongsTo(Player, {
  foreignKey: 'playerId',
  as: 'player',
})

Game.hasMany(Round, {
  foreignKey: 'gameId',
  as: 'rounds',
})

Round.belongsTo(Game, {
  foreignKey: 'gameId',
  as: 'game',
})

export {
  Player,
  Game,
  Round,
}
