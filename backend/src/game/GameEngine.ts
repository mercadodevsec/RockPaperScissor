export type Move = 'rock' | 'paper' | 'scissor'

export type RoundResult = {
    playerMove: Move
    botMove: Move
    outcome: 'win' | 'lose' | 'draw'
    message: string
    roundWinner?: 'player' | 'bot'
}


export type Winner = 'player' | 'bot'

const moves: Move[] = ['rock', 'paper', 'scissor']

const getComputerMove = (): Move => {
    const randomIndex = Math.floor(Math.random() * moves.length)
    return moves[randomIndex] as Move
}

const determineRoundResult = (playerMove: Move, botMove: Move): RoundResult => {
    if (playerMove === botMove) {
        return {
            playerMove,
            botMove,
            outcome: 'draw',
            message: 'It\'s a draw!',
        }
    }

    const winningPairs: Record<Move, Move> = {
        rock: 'scissor',
        paper: 'rock',
        scissor: 'paper',
    }

    if (winningPairs[playerMove] === botMove) {
        return {
            playerMove,
            botMove,
            outcome: 'win',
            message: `${playerMove} beats ${botMove}!`,
            roundWinner: 'player',
        }
    }

    return {
        playerMove,
        botMove,
        outcome: 'lose',
        message: `${botMove} beats ${playerMove}!`,
        roundWinner: 'bot',
    }
}

class GameEngine {
    private playerScore: number = 0
    private botScore: number = 0

    determineWinnerResult() {
        if (this.playerScore === 3) {
            return 'player'
        } else if (this.botScore === 3) {
            return 'bot'
        } else {
            null
        }
    }

    addPlayerScore() {
        this.playerScore++
    }
    addComputerScore() {
        this.botScore++
    }
    getScores() {
        return {
            player: this.playerScore,
            bot: this.botScore
        }
    }
    resetGame(): void {
        this.playerScore = 0
        this.botScore = 0
    }

}

export default new GameEngine
export {
    getComputerMove,
    determineRoundResult,
}