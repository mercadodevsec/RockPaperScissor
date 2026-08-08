import type { Request, Response } from 'express'
import { Op } from 'sequelize'
import type { AuthenticatedRequest } from '../middleware/authMiddleware.ts'
import Player from '../models/Player.ts'
import Game from '../models/Game.ts'
import Round from '../models/Round.ts'
import { getComputerMove, determineRoundResult } from '../game/GameEngine.ts'
import sequelize from '../utils/connection.ts'

const validMoves = ['rock', 'paper', 'scissor']
const validOutcomes = ['win', 'lose', 'draw']

export const playRound = async (req: Request, res: Response) => {
  const move = String(req.query.move ?? '').toLowerCase()
  if (!validMoves.includes(move)) {
    return res.status(400).json({ error: 'Please provide a valid move query parameter: rock, paper, or scissor' })
  }

  try {
    const botMove = getComputerMove()
    const result = determineRoundResult(move as 'rock' | 'paper' | 'scissor', botMove)

    return res.status(200).json({
      message: 'Round result loaded successfully',
      result,
    })
  } catch (error) {
    console.error('Round processing failed:', error)
    return res.status(500).json({ error: 'Failed to compute round result' })
  }
}

export const saveGame = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const { result, playerTally, botTally, rounds } = req.body as {
      result: 'win' | 'lose' | 'draw'
      playerTally: number
      botTally: number
      rounds: Array<{ playerMove: string; botMove: string; outcome: 'win' | 'lose' | 'draw' }>
    }

    if (!validOutcomes.includes(result)) {
      return res.status(400).json({ error: 'Invalid game result' })
    }

    if (!Number.isInteger(playerTally) || !Number.isInteger(botTally) || playerTally < 0 || botTally < 0) {
      return res.status(400).json({ error: 'playerTally and botTally must be non-negative integers' })
    }

    if (!Array.isArray(rounds) || rounds.length === 0) {
      return res.status(400).json({ error: 'Rounds are required to save a game' })
    }

    for (const round of rounds) {
      if (!validMoves.includes(round.playerMove) || !validMoves.includes(round.botMove) || !validOutcomes.includes(round.outcome)) {
        return res.status(400).json({ error: 'Invalid round data' })
      }
    }

    const resultGame = await sequelize.transaction(async (transaction) => {
      const newGame = await Game.create(
        {
          playerId: req.user?.id,
          result,
          playerTally,
          botTally,
        },
        { transaction },
      )

      await Round.bulkCreate(
        rounds.map((round, index) => ({
          gameId: newGame.id,
          roundNumber: index + 1,
          playerMove: round.playerMove,
          botMove: round.botMove,
          outcome: round.outcome,
        })),
        { transaction },
      )

      return newGame
    })

    return res.status(201).json({ message: 'Game saved successfully', gameId: resultGame.id })
  } catch (error) {
    console.error('Save game failed:', error)
    return res.status(500).json({ error: 'Failed to save game' })
  }
}

export const getMyGames = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const games = await Game.findAll({
      where: { playerId: req.user.id },
      attributes: ['id', 'result', 'playerTally', 'botTally', 'createdAt'],
      order: [['createdAt', 'DESC']],
    })

    return res.status(200).json({ games })
  } catch (error) {
    console.error('Load my games failed:', error)
    return res.status(500).json({ error: 'Failed to load your game history' })
  }
}

export const getGameDetails = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  try {
    const gameId = String(req.params.gameId ?? '').trim()
    if (!gameId) {
      return res.status(400).json({ error: 'Game ID is required' })
    }

    const game = await Game.findByPk(gameId, {
      include: [
        {
          model: Player,
          as: 'player',
          attributes: ['id', 'username'],
        },
        {
          model: Round,
          as: 'rounds',
          attributes: ['roundNumber', 'playerMove', 'botMove', 'outcome'],
        },
      ],
    })

    if (!game) {
      return res.status(404).json({ error: 'Game not found' })
    }

    if (req.user.id !== game.getDataValue('playerId')) {
      return res.status(403).json({ error: 'You are not authorized to view this game' })
    }

    return res.status(200).json({ game })
  } catch (error) {
    console.error('Load game details failed:', error)
    return res.status(500).json({ error: 'Failed to load game details' })
  }
}

export const resetGame = async (req: AuthenticatedRequest, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  return res.status(200).json({ message: 'Game reset successfully' })
}

