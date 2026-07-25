export type Move = 'rock' | 'paper' | 'scissor'

export type RoundResult = {
    playerMove: Move
    computerMove: Move
    outcome: 'win' | 'lose' | 'draw'
    message: string
    winner?: 'player' | 'computer'
}

const moves: Move[] = ['rock', 'paper', 'scissor']

const getComputerMove = (): Move => {
    const randomIndex = Math.floor(Math.random() * moves.length)
    return moves[randomIndex] as Move
}

const determineRoundResult = (playerMove: Move, computerMove: Move): RoundResult => {
    if (playerMove === computerMove) {
        return {
            playerMove,
            computerMove,
            outcome: 'draw',
            message: 'It\'s a draw!',
        }
    }

    const winningPairs: Record<Move, Move> = {
        rock: 'scissor',
        paper: 'rock',
        scissor: 'paper',
    }

    if (winningPairs[playerMove] === computerMove) {
        return {
            playerMove,
            computerMove,
            outcome: 'win',
            message: `${playerMove} beats ${computerMove}!`,
            winner: 'player',
        }
    }

    return {
        playerMove,
        computerMove,
        outcome: 'lose',
        message: `${computerMove} beats ${playerMove}!`,
        winner: 'computer',
    }
}

export default {
    getComputerMove,
    determineRoundResult,
}