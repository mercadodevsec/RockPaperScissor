import type { Request, Response } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Player from '../models/Player.ts'

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error('Missing JWT_SECRET environment variable')
}

const createToken = (playerId: string, username: string) => {
  return jwt.sign(
    {
      sub: playerId,
      username,
    },
    jwtSecret,
    {
      expiresIn: '2h',
    },
  )
}

const sanitizeUsername = (username: string) => {
  return username.trim().toLowerCase()
}

const buildUserResponse = (player: { id: string; username: string }) => ({
  id: player.id,
  username: player.username,
})

export const register = async (req: Request, res: Response) => {
  try {
    const username = String(req.body.username ?? '').trim()
    const password = String(req.body.password ?? '')

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ error: 'Username must be between 3 and 30 characters' })
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ error: 'Username can only include letters, numbers, and underscores' })
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password must be at least 8 characters long' })
    }

    const normalizedUsername = sanitizeUsername(username)
    const existing = await Player.findOne({ where: { username: normalizedUsername } })
    if (existing) {
      return res.status(409).json({ error: 'A player with that username already exists' })
    }

    const passwordHash = await bcrypt.hash(password, 10)

    const player = await Player.create({
      username: normalizedUsername,
      passwordHash,
    })

    const token = createToken(player.id, player.username)

    return res.status(201).json({
      token,
      user: buildUserResponse(player),
    })
  } catch (error) {
    console.error('Register error:', error)
    return res.status(500).json({ error: 'Failed to register player' })
  }
}

export const login = async (req: Request, res: Response) => {
  try {
    const username = String(req.body.username ?? '').trim()
    const password = String(req.body.password ?? '')

    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' })
    }

    const normalizedUsername = sanitizeUsername(username)
    const player = await Player.findOne({ where: { username: normalizedUsername } })

    if (!player) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const passwordMatches = await bcrypt.compare(password, player.getDataValue('passwordHash'))
    if (!passwordMatches) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const token = createToken(player.id, player.username)

    return res.status(200).json({
      token,
      user: buildUserResponse({ id: player.id, username: player.username }),
    })
  } catch (error) {
    console.error('Login error:', error)
    return res.status(500).json({ error: 'Failed to authenticate player' })
  }
}
