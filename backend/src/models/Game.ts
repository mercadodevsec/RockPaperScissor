import { DataTypes } from 'sequelize'
import sequelize from '../utils/connection.ts'

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  playerId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'players',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  result: {
    type: DataTypes.ENUM('win', 'lose', 'draw'),
    allowNull: false,
  },
  playerTally: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
  botTally: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
  },
}, {
  tableName: 'games',
  timestamps: true,
})

export default Game