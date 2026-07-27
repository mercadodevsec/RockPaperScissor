import { useEffect, useState } from 'react'
import './index.css'

type Move = 'rock' | 'paper' | 'scissor'

function App() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting')
  const [roundState, setRoundState] = useState<'countdown' | 'result'>('result')
  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(true)
  const [countdown, setCountdown] = useState(1)
  const [playerMove, setSelectedMove] = useState<Move | null>(null)
  const [computerMove, setComputerMove] = useState<Move | null>(null)
  const [resultMessage, setResultMessage] = useState('')
  const [checkHighScore, setCheckHighScore] = useState(false)
  const [playerTally, setPlayerTally] = useState('')
  const [computerTally, setComputerTally] = useState('')
  const [printLeaderboard, setPrintLeaderboard] = useState<React.ReactNode>(null)
  const [winner, setWinner] = useState<'player' | 'computer' | null>(null)
  const [gameResult, setGameResult] = useState<{
    result: {
      playerMove: Move
      computerMove: Move
      outcome: 'win' | 'lose' | 'draw'
      message: string
      roundWinner: 'player' | 'computer'
      gameWinner: 'player' | 'computer'
    }
  } | null>(null)

  const [gameLeaderboard, setGameLeaderbord] = useState<{
    name: string
    result: 'player' | 'computer'
    playerTally: number
    computerTally: number
    datestamp: string
  }[]>([])

  // start game with selected move
  const startGame = (move: 'rock' | 'paper' | 'scissor') => {
    setSelectedMove(move)
    setResultMessage('')
    setRoundState('countdown')
    setCountdown(1)
  }

  // handle High Score Button
  const handleHighScoreClick = () => {
    setCheckHighScore(true)
  }

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
      } else {
        setPlayerName('Player')
        setShowNameInput(false)
      }
    }
  }
  // handle back button from High score page
  const handleBackButton = () => {
    setCheckHighScore(false)
  }






  // push data leaderboard to backend
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
            computerTally: computerTally.length / 2,
            datestamp: new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })
          }
          console.log(payload)

          await fetch(`http://localhost:3000/api/game/save`, {
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







  // fetch data leaderboard if user wants to view high score 
  useEffect(() => {
    const abortController = new AbortController()

    if (checkHighScore) {
      const fetchGameLeaderboard = async () => {
        try {
          const printSymbol = (count: number, emoji: string): string => {
            return emoji.repeat(count)
          }

          // ✅ Connect abort signal to fetch
          const res = await fetch(`http://localhost:3000/api/game/load`, {
            signal: abortController.signal // ✅ Add this!
          })

          // ✅ Check if response is OK
          if (!res.ok) {
            throw new Error(`HTTP ${res.status}: ${res.statusText}`)
          }

          const leaderboardResult = await res.json()

          //  Only update if still mounted

          //  Set the data (use leaderboardResult directly)
          setGameLeaderbord(leaderboardResult)
          console.log('📊 Leaderboard data:', leaderboardResult)

          //  Get games array from the result
          const games = leaderboardResult.games || []

          //  Now create HTML from the fetched data
          const leaderboardJSX = games.map((game: any) => (
            <li key={game.id}>
              <h2>{game.name}</h2>
              <h2>{game.result}</h2>
              <h2>{printSymbol(game.playerTally, '🔵')}</h2>
              <h2>{printSymbol(game.computerTally, '🔴')}</h2>
              <h2>{game.datestamp}</h2>
            </li>
          ))

          setPrintLeaderboard(<ol id='score-list-display'>{leaderboardJSX}</ol>)

        } catch (error) {
          //  Ignore abort errors (cleanup)
          console.error('❌ Error fetching leaderboard:', error)
        }
      }

      fetchGameLeaderboard()
    }

    // ✅ Cleanup: abort fetch and mark as unmounted
    return () => {
      abortController.abort()
    }
  }, [checkHighScore])







  // insert fetch call to server here to get computer move and result
  useEffect(() => {
    const abortController = new AbortController()
    if (roundState === 'countdown') {
      // Auto-runs when playerMove changes
      const fetchRoundResultData = async () => {
        try {
          const res = await fetch(`http://localhost:3000/api/game/results?move=${playerMove}`)
          const gameResult = await res.json()
          setGameResult(gameResult)
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
        setComputerMove(gameResult.result.computerMove)
        setResultMessage(gameResult.result.message)
        if (gameResult.result.roundWinner === 'player') {
          setPlayerTally((prev) => prev + '🔵')
        } else if (gameResult.result.roundWinner === 'computer') {
          setComputerTally((prev) => prev + '🔴')
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
    if (gameResult?.result?.gameWinner && countdown === 0) {
      const winner = gameResult.result.gameWinner
      setGameState('finished')
      setWinner(winner)
    }
  }, [gameResult, countdown])






  if (checkHighScore) {

    return (
      <div>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        <h2 id='score-title-display'>Leaderboard</h2>
        {printLeaderboard ? printLeaderboard : <p>No data</p>}
        <button id='back-btn' onClick={handleBackButton}>Go back</button>
      </div>
    )
  }







  // render different game states
  if (gameState === 'waiting') {
    return (
      <div>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        <div>
          <button id='play-btn' onClick={handlePlayClick}>Play</button>
          <button id='view-highscore-btn' onClick={handleHighScoreClick}>View High Score</button>
        </div>
      </div>
    )
  } else if (gameState === 'playing') {
    return (
      <div>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        {showNameInput ? (
          <div id='user-name-container'>
            <h2>
              Enter your name:
              <input
                id='user-name-el'
                type='text'
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value.slice(0, 1).toUpperCase() + e.target.value.slice(1))}
                onKeyDown={handleKeyDown}
                autoFocus
              />
            </h2>
          </div>
        ) : (
          <>
            <h2 id='tally-display'>{playerName}: {playerTally}</h2>
            <h2 id='tally-display'>Computer: {computerTally}</h2>
            {roundState === 'countdown' ? (
              <>
                <div id='move-dispslay-container'>
                  <h2 id='move-display'>{playerMove}</h2>
                </div>
                <h2 id='countdown-display'>{countdown}</h2>
              </>
            ) : roundState === 'result' ? (
              <>
                <div id='move-display-container'>
                  <h2 id='move-display'>{playerMove}</h2>
                  <h2 id='computer-move-display'>{computerMove}</h2>
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
      <div>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        <h2 id='tally-display'>{playerName}: {playerTally}</h2>
        <h2 id='tally-display'>Computer: {computerTally}</h2>
        <div id='move-display-container'>
          <h2 id='move-display'>{playerMove}</h2>
          <h2 id='computer-move-display'>{computerMove}</h2>
          <h2 id='countdown-display'>{resultMessage}</h2>
        </div>
        {winner === 'player' ? (
          <h2 id='winner-display'>{playerName} wins!</h2>
        ) : (
          <h2 id='winner-display'>Computer wins!</h2>
        )}
        <button
          onClick={() => {
            setGameState('playing')
            // setPlayerName('')
            setSelectedMove(null)
            setResultMessage('')
            setPlayerTally('')
            setComputerTally('')
            setWinner(null)
          }}
        >
          Play Again
        </button>
        <button
          onClick={() => {
            setGameState('waiting')
            setPlayerName('')
            setSelectedMove(null)
            setResultMessage('')
            setPlayerTally('')
            setComputerTally('')
            setWinner(null)
          }}
        >
          New Game
        </button>
        <button id='view-highscore-btn' onClick={handleHighScoreClick}>View High Score</button>
      </div>
    )
  }

  return null
}


export default App