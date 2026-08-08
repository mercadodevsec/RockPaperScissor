import { DataTypes } from 'sequelize'
import sequelize from '../utils/connection.ts'

const Round = sequelize.define('Round', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  gameId: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'games',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },
  roundNumber: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  playerMove: {
    type: DataTypes.ENUM('rock', 'paper', 'scissor'),
    allowNull: false,
  },
  botMove: {
    type: DataTypes.ENUM('rock', 'paper', 'scissor'),
    allowNull: false,
  },
  outcome: {
    type: DataTypes.ENUM('win', 'lose', 'draw'),
    allowNull: false,
  },
}, {
  tableName: 'rounds',
  timestamps: false,
})

export default Round
