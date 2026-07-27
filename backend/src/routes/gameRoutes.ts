import express from 'express'
import { roundResults, saveGameResult, loadLeaderboard } from '../controllers/gameControllers.ts'

const router = express.Router()


// GEt methods
router.get('/results', roundResults)
router.get('/load', loadLeaderboard)

// POST methods
router.post('/save', saveGameResult)


export default router;