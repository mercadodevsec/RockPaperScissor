export type Move = 'rock' | 'paper' | 'scissor'

export type RoundResult = {
    playerMove: Move
    computerMove: Move
    outcome: 'win' | 'lose' | 'draw'
    message: string
    roundWinner?: 'player' | 'computer'
}


export type Winner = 'player' | 'computer'

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
            roundWinner: 'player',
        }
    }

    return {
        playerMove,
        computerMove,
        outcome: 'lose',
        message: `${computerMove} beats ${playerMove}!`,
        roundWinner: 'computer',
    }
}

class GameEngine {
    private playerScore: number = 0
    private computerScore: number = 0

    determineWinnerResult() {
        if (this.playerScore === 3) {
            return 'player'
        } else if (this.computerScore === 3) {
            return 'computer'
        } else {
            null
        }
    }

    addPlayerScore() {
        this.playerScore++
    }
    addComputerScore() {
        this.computerScore++
    }
    getScores() {
        return {
            player: this.playerScore,
            computer: this.computerScore
        }
    }
    resetGame(): void {
        this.playerScore = 0
        this.computerScore = 0
    }

}

export default new GameEngine
export {
    getComputerMove,
    determineRoundResult,
}