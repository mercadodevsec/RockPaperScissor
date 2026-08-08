import express from 'express'
import { authenticate } from '../middleware/authMiddleware.ts'
import { playRound, saveGame, getMyGames, getGameDetails, resetGame } from '../controllers/gameControllers.ts'

const router = express.Router()

router.get('/results', playRound)
router.post('/save', authenticate, saveGame)
router.get('/me/games', authenticate, getMyGames)
router.get('/:gameId', authenticate, getGameDetails)
router.post('/reset', resetGame)

export default router