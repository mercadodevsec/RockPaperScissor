import express from 'express'
import { roundResults, gameWinner } from '../controllers/gameControllers.ts'

const router = express.Router()


// Get methods
router.get('/results', roundResults)
// router.get('/results', gameWinner)



export default router;