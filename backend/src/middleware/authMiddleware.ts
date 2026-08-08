import type{ Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import Player from '../models/Player.ts'

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string
    username: string
  }
}

const jwtSecret = process.env.JWT_SECRET
if (!jwtSecret) {
  throw new Error('Missing JWT_SECRET environment variable')
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
) => {
  const authorization = req.headers.authorization
  const token = authorization?.startsWith('Bearer ') ? authorization.slice(7) : undefined

  if (!token) {
    return res.status(401).json({ error: 'Authorization token is required' })
  }

  try {
    const payload = jwt.verify(token, jwtSecret) as {
      sub: string
      username: string
    }

    const player = await Player.findByPk(payload.sub)
    if (!player) {
      return res.status(401).json({ error: 'Invalid authorization token' })
    }

    req.user = {
      id: payload.sub,
      username: payload.username,
    }

    next()
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired authorization token' })
  }
}
