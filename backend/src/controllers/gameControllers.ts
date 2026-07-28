import type { Request, Response } from 'express';
import Game, { getComputerMove, determineRoundResult, type Move } from '../game/GameEngine.ts'
import GameModel from '../models/Game.ts'

export const resetGame = (req: Request, res: Response) => {
    try {
        Game.resetGame()
        console.log('Game reset successfully')
    } catch (error) {
        res.status(500).json({ error: 'Soomething went wrong. Failed to reset game' })
    }

}

export const roundResults = (req: Request, res: Response) => {
    const move = req.query.move?.toString().toLowerCase();
    const validMoves: Move[] = ['rock', 'paper', 'scissor'];

    if (!move || !validMoves.includes(move as Move)) {
        return res.status(400).json({
            message: 'Please provide a valid move query parameter: rock, paper, or scissor',
        });
    }

    const computerMove = getComputerMove();
    const result = determineRoundResult(move as Move, computerMove);


    if (result.roundWinner === 'player') {
        Game.addPlayerScore()
        console.log('player', Game.getScores().player)
    } else if (result.roundWinner === 'computer') {
        Game.addComputerScore()
        console.log('computer', Game.getScores().computer)
    }

    if (Game.determineWinnerResult()) {
        const winner = Game.determineWinnerResult()
        console.log('winner:', winner)
        Game.resetGame()
        return res.json({
            result: {
                ...result,
                gameWinner: winner,
            }
        })
    }

    return res.json({
        result
    });
}

export const saveGameResult = async (req: Request, res: Response) => {
    try {
        //  Gets payload from request body
        const { name, result, playerTally, computerTally, datestamp } = req.body

        // Uses Model to save (Model uses connection internally)
        const game = await GameModel.create({
            name,
            result,
            playerTally,
            computerTally,
            datestamp
        })
        console.log('📥 Received payload:', req.body)
    } catch (error) {
        res.status(500).json({ error: 'Failed to save game' })
    }
}

export const loadLeaderboard = async (req: Request, res: Response) => {
    try {
        // ✅ Get all games from database, sorted by playerTally (highest first)
        const games = await GameModel.findAll({
            attributes: ['name', 'result', 'playerTally', 'computerTally', 'datestamp'],
            order: [
                ['playerTally', 'DESC'],  // Highest score first
                ['createdAt', 'DESC']     // Then newest first
            ],
        })

        console.log(`Loaded ${games.length} games from leaderboard`)

        res.status(200).json({
            message: 'Leaderboard loaded successfully',
            games: games
        })
    } catch (error) {
        console.error('❌ Error loading leaderboard:', error)
        res.status(500).json({ error: 'Failed to load the leaderboard' })
    }
}

