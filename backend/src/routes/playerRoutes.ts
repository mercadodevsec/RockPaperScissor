import express from 'express'
import { authenticate } from '../middleware/authMiddleware.ts'
import { getPlayerGames, getPlayerStats, searchPlayers } from '../controllers/playerControllers.ts'

const router = express.Router()

router.get('/search', authenticate, searchPlayers)
router.get('/:playerId/games', authenticate, getPlayerGames)
router.get('/:playerId/stats', authenticate, getPlayerStats)

export default router
