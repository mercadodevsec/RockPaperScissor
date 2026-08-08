import type { Request, Response } from 'express'
import { Op } from 'sequelize'
import Player from '../models/Player.ts'
import Game from '../models/Game.ts'

export const searchPlayers = async (req: Request, res: Response) => {
  try {
    const username = String(req.query.username ?? '').trim().toLowerCase()
    if (!username) {
      return res.status(400).json({ error: 'A username query parameter is required' })
    }

    const players = await Player.findAll({
      where: {
        username: {
          [Op.like]: `%${username}%`,
        },
      },
      attributes: ['id', 'username'],
      limit: 20,
    })

    return res.status(200).json({ players })
  } catch (error) {
    console.error('Search players error:', error)
    return res.status(500).json({ error: 'Failed to search for players' })
  }
}

export const getPlayerGames = async (req: Request, res: Response) => {
  try {
    const playerId = String(req.params.playerId ?? '').trim()
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' })
    }

    const player = await Player.findByPk(playerId, {
      attributes: ['id', 'username'],
    })
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }

    const games = await Game.findAll({
      where: { playerId },
      attributes: ['id', 'result', 'playerTally', 'botTally', 'createdAt'],
      order: [['createdAt', 'DESC']],
    })

    return res.status(200).json({
      player: {
        id: player.id,
        username: player.username,
      },
      games,
    })
  } catch (error) {
    console.error('Get player games error:', error)
    return res.status(500).json({ error: 'Failed to load player game history' })
  }
}

export const getPlayerStats = async (req: Request, res: Response) => {
  try {
    const playerId = String(req.params.playerId ?? '').trim()
    if (!playerId) {
      return res.status(400).json({ error: 'Player ID is required' })
    }

    const player = await Player.findByPk(playerId, {
      attributes: ['id', 'username'],
    })
    if (!player) {
      return res.status(404).json({ error: 'Player not found' })
    }

    const games = await Game.findAll({
      where: { playerId },
      attributes: ['result', 'playerTally', 'botTally'],
    })

    const totalGames = games.length
    const wins = games.filter((game) => game.result === 'win').length
    const losses = games.filter((game) => game.result === 'lose').length
    const draws = games.filter((game) => game.result === 'draw').length
    const totalRounds = games.reduce((sum, game) => sum + game.playerTally + game.botTally, 0)
    const winPercentage = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0

    return res.status(200).json({
      player: {
        id: player.id,
        username: player.username,
      },
      stats: {
        totalGames,
        wins,
        losses,
        draws,
        winPercentage,
        totalRounds,
      },
    })
  } catch (error) {
    console.error('Get player stats error:', error)
    return res.status(500).json({ error: 'Failed to load player statistics' })
  }
}
