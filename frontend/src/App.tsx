import { useEffect, useState } from 'react'
import './index.css'


type Move = 'rock' | 'paper' | 'scissor'

interface GameResult {
  playerMove: Move
  botMove: Move
  outcome: 'win' | 'lose' | 'draw'
  message: string
  roundWinner: 'player' | 'bot'
  gameWinner: 'player' | 'bot'
}

interface GameHistoryEntry {
  id: number
  name: string
  result: 'player' | 'bot'
  playerTally: number
  botTally: number
  datestamp: string
}

function App() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting')
  const [roundState, setRoundState] = useState<'countdown' | 'result' | 'idle'>('idle')
  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(true)
  const [countdown, setCountdown] = useState(3)
  const [playerMove, setPlayerMove] = useState<Move | null>(null)
  const [botMove, setBotMove] = useState<Move | null>(null)
  const [resultMessage, setResultMessage] = useState('')
  const [checkGameHistory, setCheckGameHistory] = useState(false)
  const [playerTally, setPlayerTally] = useState('')
  const [botTally, setBotTally] = useState('')
  const [printGameHistory, setPrintGameHistory] = useState<React.ReactNode>(null)
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null)
  const [gameResult, setGameResult] = useState<GameResult | null>(null)
  const getMoveImage = (move: Move | null) => {
    if (move === 'rock') return './src/assets/images/Rock.jpg'
    if (move === 'paper') return './src/assets/images/Paper.jpg'
    if (move === 'scissor') return './src/assets/images/Scissor.jpg'
    return ''
  }

  const playerRenderImagesJSX = <img src={getMoveImage(playerMove)} alt='Move' />
  const botRenderImagesJSX = <img src={getMoveImage(botMove)} alt='Move' />


  // start game with selected move
  const startGame = (move: 'rock' | 'paper' | 'scissor') => {
    setPlayerMove(move)
    setResultMessage('')
    setRoundState('countdown')
    setCountdown(3)
  }

  // handle Game History Button
  const handleGameHistoryClick = () => {
    setCheckGameHistory(true)
  }

  // handle Play button click
  const handlePlayClick = () => {
    setGameState('playing')

    // fetch reset api
    const resetGame = async () => {
      try {
        await fetch('http://localhost:3000/api/game/reset', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        })
      } catch (error) {
        console.log('Reset failed:', error)
      }
    }
    resetGame()
  }

  // handle Enter key press in name input
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      const name = playerName.trim()
      if (name) {
        setPlayerName(name)
        setShowNameInput(false)
      } else {
        setPlayerName('Player')
        setShowNameInput(false)
      }
    }
  }
  // handle back button from High score page
  const handleBackButton = () => {
    setCheckGameHistory(false)
  }






  // push data GameHistory to backend
  useEffect(() => {
    const abortController = new AbortController()

    if (gameState === 'finished') {
      if (!playerName || !winner) {
        console.error('Missing required data')
        return
      }
      const pushLeaderbordData = async () => {
        try {
          const payload = {
            name: playerName,
            result: winner,
            playerTally: playerTally.length / 2,
            botTally: botTally.length / 2,
            datestamp: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          }
          await fetch(`http://localhost:3000/api/game/save`, {
            signal: abortController.signal,
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
          })
        } catch (error) {
          console.error('Error:', error)
        }
      }
      pushLeaderbordData()
    }
    return () => {
      abortController.abort() // 
    }
  }, [gameState])







  // fetch data GameHistory if user wants to view high score 
  useEffect(() => {
    const abortController = new AbortController()

    if (checkGameHistory) {
      const fetchGameGameHistory = async () => {
        try {
          const printSymbol = (count: number, emoji: string): string => {
            return emoji.repeat(count)
          }
          const res = await fetch(`http://localhost:3000/api/game/load`, {
            signal: abortController.signal // ✅ Add this!
          })
          const GameHistoryResult = await res.json()

          //  Set the data (use GameHistoryResult directly)
          console.log('📊 GameHistory data:', GameHistoryResult)

          //  Get games array from the result
          const games = GameHistoryResult.games

          //  Now create HTML from the fetched data
          const GameHistoryJSX = games.map((game: GameHistoryEntry) => (
            <li>
              <h2>{game.name}</h2>
              <h2>{printSymbol(game.playerTally, '🔵')}</h2>
              <h2>{printSymbol(game.botTally, '🔴')}</h2>
              <h2>{game.result === 'player' ? (game.name) : (game.result)}</h2>
              <h2>{game.datestamp}</h2>
            </li>
          ))

          setPrintGameHistory(<ol id='score-list-display'>{GameHistoryJSX}</ol>)

        } catch (error) {
          //  Ignore abort errors (cleanup)
          console.error('❌ Error fetching GameHistory:', error)
        }
      }

      fetchGameGameHistory()
    }

    // ✅ Cleanup: abort fetch and mark as unmounted
    return () => {
      abortController.abort()
    }
  }, [checkGameHistory])







  // insert fetch call to server here to get bot move and result
  useEffect(() => {
    const abortController = new AbortController()
    if (roundState === 'countdown') {
      // Auto-runs when playerMove changes
      const fetchRoundResultData = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/game/results?move=${playerMove}`, {
            signal: abortController.signal
          })
          const gameResult = await res.json()
          setGameResult(gameResult.result)
        }
        catch (error) {
          console.error('Error:', error)
        }
      }
      fetchRoundResultData()
    }
    return () => {
      abortController.abort()
    }
  }, [roundState, playerMove])







  // countdown effect
  useEffect(() => {
    if (roundState !== 'countdown') {
      return
    }
    if (countdown === 0) {
      if (gameResult) {
        setBotMove(gameResult.botMove)
        setResultMessage(gameResult.message)
        if (gameResult.roundWinner === 'player') {
          setPlayerTally((prev) => prev + '🔵')
        } else if (gameResult.roundWinner === 'bot') {
          setBotTally((prev) => prev + '🔴')
        }
        setRoundState('result')
      }
      return
    }
    const timer = window.setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [countdown, roundState, gameResult])







  // fetch winner in server if there is
  useEffect(() => {
    if (gameResult?.gameWinner && countdown === 0) {
      const winner = gameResult.gameWinner
      setGameState('finished')
      setWinner(winner)
    }
  }, [gameResult, countdown])






  if (checkGameHistory) {
    return (
      <div className='title-container'>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        <h2 id='score-title-display'>Game History</h2>
        {printGameHistory ? (
          <>
            <div id='GameHistory-headers-display'>
              <h2>Player</h2>
              <h2>Player Score</h2>
              <h2>Bot Score</h2>
              <h2>Winner</h2>
              <h2>Date</h2>
            </div>
            {printGameHistory}
          </>
        ) : <p>No data</p>}
        <button id='back-btn' onClick={handleBackButton}>Go back</button>
      </div>
    )
  }





  // render different game states
  if (gameState === 'waiting') {
    return (
      <div className='title-container'>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        <div id='title-btn-container'>
          <button id='play-btn' onClick={handlePlayClick}>Play</button>
          <button id='view-gamehistory-btn' onClick={handleGameHistoryClick}>View Game History</button>
        </div>
      </div>
    )
  } else if (gameState === 'playing') {
    return (
      <div className='title-container'>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        {showNameInput ? (
          <div id='user-name-container'>
            <h2>
              Enter your name:
              <input
                id='user-name-el'
                type='text'
                value={playerName}
                onChange={(e) => {
                  const clean = e.target.value.replace(/[^a-zA-Z]/g, '');
                  setPlayerName(clean.charAt(0).toUpperCase() + clean.slice(1));
                }}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </h2>
          </div>
        ) : (
          <>
            <h2 id='tally-display'>{playerName}: {playerTally}</h2>
            <h2 id='tally-display'>Bot: {botTally}</h2>
            {roundState === 'countdown' ? (
              <>
                <div id='move-display-container'>
                  <h2 id='move-display'>{playerRenderImagesJSX}</h2>
                </div>
                <h2 id='countdown-display'>{countdown}</h2>
              </>
            ) : roundState === 'result' ? (
              <>
                <div id='move-display-container'>
                  <h2 id='move-display'>{playerRenderImagesJSX}</h2>
                  <h2 id='bot-move-display'>{botRenderImagesJSX}</h2>
                </div>
                <h2 id='countdown-display'>{resultMessage}</h2>
                <div id='game-btns-container'>
                  <button id='rock-btn' onClick={() => startGame('rock')}>Rock</button>
                  <button id='paper-btn' onClick={() => startGame('paper')}>Paper</button>
                  <button id='scissor-btn' onClick={() => startGame('scissor')}>Scissor</button>
                </div>
              </>
            ) : (
              <>
                <div id='game-btns-container'>
                  <button id='rock-btn' onClick={() => startGame('rock')}>Rock</button>
                  <button id='paper-btn' onClick={() => startGame('paper')}>Paper</button>
                  <button id='scissor-btn' onClick={() => startGame('scissor')}>Scissor</button>
                </div>
              </>
            )}
          </>
        )}
      </div>
    )
  } else if (gameState === 'finished') {
    return (
      <div className='title-container'>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        <h2 id='tally-display'>{playerName}: {playerTally}</h2>
        <h2 id='tally-display'>Bot: {botTally}</h2>
        <div id='move-display-container'>
          <h2 id='move-display'>{playerRenderImagesJSX}</h2>
          <h2 id='bot-move-display'>{botRenderImagesJSX}</h2>
        </div>
        <h2 id='countdown-display'>{resultMessage}</h2>
        {winner === 'player' ? (
          <h2 id='winner-display'>{playerName} wins!</h2>
        ) : (
          <h2 id='winner-display'>Bot wins!</h2>
        )}
        <button
          onClick={() => {
            setGameState('playing')
            setPlayerMove(null)
            setResultMessage('')
            setPlayerTally('')
            setBotTally('')
            setWinner(null)
            setBotMove(null)
            setRoundState('idle')
          }}
        >
          Play Again
        </button>
        <button
          onClick={() => {
            setGameState('waiting')
            setPlayerName('')
            setPlayerMove(null)
            setResultMessage('')
            setPlayerTally('')
            setBotTally('')
            setWinner(null)
            setShowNameInput(true)
            setBotMove(null)
            setRoundState('idle')
          }}
        >
          New Game
        </button>
        <button id='view-gamehistory-btn' onClick={handleGameHistoryClick}>View Game History</button>
      </div>
    )
  }

  return null
}


export default App