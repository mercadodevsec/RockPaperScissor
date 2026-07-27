import type { Request, Response } from 'express';
import Game, { getComputerMove, determineRoundResult, type Move } from '../game/GameEngine.ts'

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

    // if (Game.determineWinnerResult()) {
    //     const winner = Game.determineWinnerResult()
    //     Game.resetGame()
    //     return res.json({
    //         ...result,           // ← Spread original
    //         gameWinner: winner,
    //     })
    // }

    return res.json({
        result
    });
}

export const gameWinner = (req: Request, res: Request) => {
    // const winner
}

