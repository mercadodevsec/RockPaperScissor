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
  const [resultMessage, setResultMessage] = useState('')

  const handlePlayClick = () => {
    setGameState('playing')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const name = playerName.trim()
      if (name) {
        setPlayerName(name)
        setShowNameInput(false)
      }
    }
  }

  const startGame = (move: Move) => {
    setSelectedMove(move)
    setResultMessage('')
    setRoundState('countdown')
    setCountdown(3)
  }

  useEffect(() => {
    if (roundState !== 'countdown') {
      return
    }

    if (countdown === 0) {
      if (selectedMove) {
        const computerMove = GameEngine.getComputerMove()
        const roundResult = GameEngine.determineRoundResult(selectedMove, computerMove)
        setResultMessage(roundResult.message)
      }
      setRoundState('result')
      return
    }

    const timer = window.setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [countdown, roundState, selectedMove])


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
            <h2 id="player-name-display">Player Name: {playerName}</h2>
            {roundState === 'countdown' ? (
              <h2 id="countdown-display">{countdown}</h2>
            ) : (
              <h2 id="countdown-display">{resultMessage || 'Result'}</h2>
            )}

            <div id="game-btns-container">
              <button id="rock-btn" onClick={() => startGame('rock')}>Rock</button>
              <button id="paper-btn" onClick={() => startGame('paper')}>Paper</button>
              <button id="scissor-btn" onClick={() => startGame('scissor')}>Scissor</button>
            </div>


          </>
        )}
      </div>
    )
  } else if (gameState === 'finished') {
    return (
      <div>
        <h1 id="title">Rock-Paper-Scissor</h1>
        <p>Game Over!</p>
        <button
          onClick={() => {
            setGameState('waiting')
            setRoundState('idle')
            setShowNameInput(true)
            setPlayerName('')
            setSelectedMove(null)
            setResultMessage('')
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