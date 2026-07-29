import type { Request, Response } from 'express';
import Game, { getComputerMove, determineRoundResult, type Move } from '../game/GameEngine.ts'
import GameModel from '../models/Game.ts'

export const resetGame = (req: Request, res: Response) => {
    try {
        Game.resetGame()
        res.status(200).json({ message: 'Game reset successfully' })
        console.log('Game reset successfully')
    } catch (error) {
        res.status(500).json({ error: 'Soomething went wrong. Failed to reset game' })
    }

}

export const roundResults = (req: Request, res: Response) => {
    const move = req.query.move?.toString().toLowerCase();

    if (!move || !move.includes(move as Move)) {
        return res.status(400).json({
            message: 'Please provide a valid move query parameter: rock, paper, or scissor',
        });
    }

    const botMove = getComputerMove();
    const result = determineRoundResult(move as Move, botMove);


    if (result.roundWinner === 'player') {
        Game.addPlayerScore()
        console.log('player', Game.getScores().player)
    } else if (result.roundWinner === 'bot') {
        Game.addComputerScore()
        console.log('bot', Game.getScores().bot)
    }

    if (Game.determineWinnerResult()) {
        const winner = Game.determineWinnerResult()
        console.log('winner:', winner)
        Game.resetGame()
        return res.status(200).json({
            message: 'Results loaded successfully',
            result: {
                ...result,
                gameWinner: winner,
            }
        })
    }

    return res.status(200).json({
        message: 'Results loaded successfully',
        result
    });
}

export const saveGameResult = async (req: Request, res: Response) => {
    try {
        //  Gets payload from request body
        const { name, result, playerTally, botTally, datestamp } = req.body

        // Uses Model to save (Model uses connection internally)
        const game = await GameModel.create({
            name,
            result,
            playerTally,
            botTally,
            datestamp
        })
        res.status(201).json({ message: 'Game saved successfully' })
        console.log('Received payload!')
    } catch (error) {
        res.status(500).json({ error: 'Failed to save game' })
    }
}

export const loadGameHistory = async (req: Request, res: Response) => {
    try {
        const games = await GameModel.findAll({
            attributes: ['name', 'result', 'playerTally', 'botTally', 'datestamp'],
            order: [
                ['createdAt', 'DESC']     // Then newest first
            ],
        })

        console.log(`Loaded ${games.length} games from gamehistory`)

        res.status(200).json({
            message: 'GameHistory loaded successfully',
            games: games
        })
    } catch (error) {
        console.error('❌ Error loading gamehistory:', error)
        res.status(500).json({ error: 'Failed to load the gamehistory' })
    }
}

