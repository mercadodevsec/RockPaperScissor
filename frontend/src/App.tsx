import { useEffect, useState } from 'react'
import GameEngine, { type Move } from './GameEngine.ts'
import './index.css'

function App() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting')
  const [roundState, setRoundState] = useState<'idle' | 'countdown' | 'result'>('idle')
  const [showNameInput, setShowNameInput] = useState(true)
  const [playerName, setPlayerName] = useState('')
  const [countdown, setCountdown] = useState(3)
  const [selectedMove, setSelectedMove] = useState<Move | null>(null)
  const [computerMove, setComputerMove] = useState<Move | null>(null)
  const [resultMessage, setResultMessage] = useState('')
  const [playerScore, setPlayerScore] = useState(0)
  const [computerScore, setComputerScore] = useState(0)




  // handle Play button click
  const handlePlayClick = () => {
    setGameState('playing')
  }

  // handle Enter key press in name input
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const name = playerName.trim()
      if (name) {
        setPlayerName(name)
        setShowNameInput(false)
      }
    }
  }


  // start game with selected move
  const startGame = (move: Move) => {
    setSelectedMove(move)
    setResultMessage('')
    setRoundState('countdown')
    setCountdown(3)
  }

  // countdown effect
  useEffect(() => {
    if (roundState !== 'countdown') {
      return
    }

    if (countdown === 0) {
      if (selectedMove) {
        const computerMove = GameEngine.getComputerMove()
        const roundResult = GameEngine.determineRoundResult(selectedMove, computerMove)
        setComputerMove(computerMove)
        setResultMessage(roundResult.message)

        if (roundResult.winner === 'player') {
          setPlayerScore((prev) => prev + 1)
        } else if (roundResult.winner === 'computer') {
          setComputerScore((prev) => prev + 1)
        }

        if (playerScore >= 2 || computerScore >= 2) {
          setGameState('finished')
        }
      }
      setRoundState('result')
      return
    }

    const timer = window.setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [countdown, roundState, selectedMove])


  // render different game states
  if (gameState === 'waiting') {
    return (
      <div>
        <h1 id="title">Rock-Paper-Scissor</h1>
        <button id="play-btn" onClick={handlePlayClick}>Play</button>
      </div>
    )
  } else if (gameState === 'playing') {
    return (
      <div>
        <h1 id="title">Rock-Paper-Scissor</h1>

        {showNameInput ? (
          <div id="user-name-container">
            <h2>
              Enter your name:
              <input
                id="user-name-el"
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </h2>
          </div>
        ) : (
          <>
            <h2 id="tally-display">{playerName}: {playerScore}</h2>
            <h2 id="tally-display">Computer: {computerScore}</h2>
            {roundState === 'countdown' ? (
              <>
                <div id="move-display-container">
                  <h2 id="move-display">{selectedMove}</h2>
                </div>
                <h2 id="countdown-display">{countdown}</h2>
              </>
            ) : roundState === 'result' ? (
              <>
                <div id="move-display-container">
                  <h2 id="move-display">{selectedMove}</h2>
                  <h2 id="computer-move-display">{computerMove}</h2>
                </div>
                <h2 id="countdown-display">{resultMessage}</h2>
                <div id="game-btns-container">
                  <button id="rock-btn" onClick={() => startGame('rock')}>Rock</button>
                  <button id="paper-btn" onClick={() => startGame('paper')}>Paper</button>
                  <button id="scissor-btn" onClick={() => startGame('scissor')}>Scissor</button>
                </div>
              </>
            ) : (
              <>
                <div id="game-btns-container">
                  <button id="rock-btn" onClick={() => startGame('rock')}>Rock</button>
                  <button id="paper-btn" onClick={() => startGame('paper')}>Paper</button>
                  <button id="scissor-btn" onClick={() => startGame('scissor')}>Scissor</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    )
  } else if (gameState === 'finished') {
    return (
      <div>
        <h1 id="title">Rock-Paper-Scissor</h1>
        {playerScore > computerScore ? (
          <h2 id="winner-display">{playerName} wins!</h2>
        ) : (
          <h2 id="winner-display">Computer wins!</h2>
        )}
        <button
          onClick={() => {
            setGameState('waiting')
            setRoundState('idle')
            setShowNameInput(true)
            setPlayerName('')
            setSelectedMove(null)
            setResultMessage('')
            setPlayerScore(0)
            setComputerScore(0)
          }}
        >
          Play Again
        </button>
      </div>
    )
  }

  return null
}

export default App