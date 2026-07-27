import { useEffect, useState } from 'react'
import './index.css'

type Move = 'rock' | 'paper' | 'scissor'

function App() {
  const [gameState, setGameState] = useState<'waiting' | 'playing' | 'finished'>('waiting')
  const [roundState, setRoundState] = useState<'countdown' | 'result'>('result')
  const [showNameInput, setShowNameInput] = useState(true)
  const [playerName, setPlayerName] = useState('')
  const [countdown, setCountdown] = useState(3)
  const [playerMove, setSelectedMove] = useState<Move | null>(null)
  const [computerMove, setComputerMove] = useState<Move | null>(null)
  const [resultMessage, setResultMessage] = useState('')
  const [checkHighScore, setCheckHighScore] = useState(false)
  const [playerTally, setPlayerTally] = useState('')
  const [computerTally, setComputerTally] = useState('')
  const [winner, setWinner] = useState<'player' | 'computer' | null>(null)
  const [gameResult, setGameResult] = useState<{
    result: {
      playerMove: Move
      computerMove: Move
      outcome: 'win' | 'lose' | 'draw'
      message: string
      roundWinner?: 'player' | 'computer'
    }
  } | null>(null)
  const [gameLeaderboard, setGameLeaderbord] = useState("")

  // start game with selected move
  const startGame = (move: 'rock' | 'paper' | 'scissor') => {
    setSelectedMove(move)
    setResultMessage('')
    setRoundState('countdown')
    setCountdown(3)
  }

  // handle High Score Button
  const handleHighScoreClick = async () => {
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
      }
    }
  }

  // push data leaderboard to backend
  useEffect(() => {
    if (gameState === 'finished') {
      const pushLeaderbordData = async () => {
        try {
          await fetch(`http://localhost:3000/api/game`, {
            method: 'POST'
            // add proeprties
          })
        } catch (error) {
          console.error('Error:', error)
        }
      }
      pushLeaderbordData()
    }
  }, [gameState])

  // fetch data leaderboard if user wants to view high score 
  // useEffect(async () => {
  //   const fetchGameLeaderboard = async () => {
  //     try {
  //       const res = await fetch(`http://localhost:3000/api/game`)
  //       const leaderboardResult = await res.json()
  //       const leaderBoardResultHTML = leaderboardResult.map(score => 

  //      ).join('')

  //       return


  //       // setGameLeaderbord(strings)

  //     } catch (error) {
  //       console.error('Error:', error)
  //     }
  //   }

  // }, [checkHighScore])
  // insert fetch call to server here to get computer move and result
  useEffect(() => {
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
  }, [roundState])

  // countdown effect
  useEffect(() => {
    if (roundState !== 'countdown') {
      return
    }
    if (countdown === 0) {
      if (playerMove && gameResult) {
        setComputerMove(gameResult.result.computerMove)
        setResultMessage(gameResult.result.message)
        if (gameResult.result.roundWinner === 'player') {
          setPlayerTally((prev) => prev + '🔵')
        } else if (gameResult.result.roundWinner === 'computer') {
          setComputerTally((prev) => prev + '🔴')
        }
      }
      setRoundState('result')
      return
    }
    const timer = window.setTimeout(() => {
      setCountdown((prev) => prev - 1)
    }, 1000)

    return () => window.clearTimeout(timer)
  }, [countdown, roundState, playerMove])

  // useEffect(() => {
  //   if (gameResult && 'gameWinner' in gameResult) {
  //     const winner = gameResult.gameWinner

  //     if (winner === 'player' || winner === 'computer') {
  //       setWinner(winner)
  //     } else {
  //       setWinner(null)
  //     }
  //   }
  //   setGameState('finished')
  // }, [gameResult])



  // if (checkHighScore === true) {
  //   return (
  //     <div>
  //       <h1 id='title'>Rock-Paper-Scissor</h1>
  //       <h2> id='core-title-display</h2>
  //       <ol id='list-display'>
  //         {gameLeaderboard ? (
  //           <li>{printLeaderboard}</li>
  //         ) : ""}
  //       </ol>
  //     </div>
  //   )
  // }
  // render different game states

  if (gameState === 'waiting') {
    return (
      <div>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        <div>
          <button id='play-btn' onClick={handlePlayClick}>Play</button>
          <button id='view-highscore-btn' onClick={handleHighScoreClick}></button>
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
            setGameState('waiting')
            setShowNameInput(true)
            setPlayerName('')
            setSelectedMove(null)
            setResultMessage('')
            setPlayerTally('')
            setComputerTally('')
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