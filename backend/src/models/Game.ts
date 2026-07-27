import { DataTypes, Model } from 'sequelize'
import sequelize from '../utils/connection.ts'

const Game = sequelize.define('Game', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  result: {
    type: DataTypes.STRING,
    allowNull: false
  },
  playerTally: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  computerTally: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  datestamp: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'leaderboard',
  timestamps: true
})

export default Game