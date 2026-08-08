import { useEffect, useMemo, useState } from 'react'
import './index.css'
import rockImage from './assets/images/Rock.jpg'
import paperImage from './assets/images/Paper.jpg'
import scissorImage from './assets/images/Scissor.jpg'
import {
  fetchMyGames,
  fetchPlayerGames,
  fetchPlayerStats,
  login,
  playRound,
  register,
  saveGame,
  searchPlayers,
} from './api'
import type { ApiUser, GameSummary, Move, PlayerSummary } from './api'

interface RoundPayload {
  playerMove: Move
  botMove: Move
  outcome: 'win' | 'lose' | 'draw'
  message: string
}

type Page = 'login' | 'game' | 'history' | 'search'

type LoadState = 'idle' | 'loading' | 'success' | 'error'

const moveImages: Record<Move, string> = {
  rock: rockImage,
  paper: paperImage,
  scissor: scissorImage,
}

const moveLabels: Record<Move, string> = {
  rock: 'Rock',
  paper: 'Paper',
  scissor: 'Scissor',
}

const formatResultLabel = (result: GameSummary['result']) => {
  return result === 'win' ? 'Win' : result === 'lose' ? 'Loss' : 'Tie'
}

const formatDateTime = (isoDate: string) => {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(isoDate))
}

const formatWinPercentage = (value: number) => `${Math.round(value)}%`

function App() {
  const [page, setPage] = useState<Page>('login')
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<ApiUser | null>(null)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [authError, setAuthError] = useState<string | null>(null)
  const [authLoading, setAuthLoading] = useState(false)

  const [roundState, setRoundState] = useState<'countdown' | 'result' | 'idle'>('idle')
  const [countdown, setCountdown] = useState(3)
  const [playerMove, setPlayerMove] = useState<Move | null>(null)
  const [botMove, setBotMove] = useState<Move | null>(null)
  const [resultMessage, setResultMessage] = useState('')
  const [playerScore, setPlayerScore] = useState(0)
  const [botScore, setBotScore] = useState(0)
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null)
  const [rounds, setRounds] = useState<RoundPayload[]>([])
  const [gameLoading, setGameLoading] = useState<LoadState>('idle')
  const [gameError, setGameError] = useState<string | null>(null)

  const [history, setHistory] = useState<GameSummary[]>([])
  const [historyLoading, setHistoryLoading] = useState<LoadState>('idle')
  const [historyError, setHistoryError] = useState<string | null>(null)
  const [showSignOutModal, setShowSignOutModal] = useState(false)
  const [signOutRequestedDuringMatch, setSignOutRequestedDuringMatch] = useState(false)

  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PlayerSummary[]>([])
  const [searchLoading, setSearchLoading] = useState<LoadState>('idle')
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerSummary | null>(null)
  const [publicGames, setPublicGames] = useState<GameSummary[]>([])
  const [publicStats, setPublicStats] = useState<{ totalGames: number; wins: number; losses: number; draws: number; winPercentage: number; totalRounds: number } | null>(null)

  const isAuthenticated = Boolean(token && user)

  const playerEmojis = useMemo(() => '🔵'.repeat(playerScore), [playerScore])
  const botEmojis = useMemo(() => '🔴'.repeat(botScore), [botScore])

  const clearSession = () => {
    setToken(null)
    setUser(null)
    setHistory([])
    setHistoryError(null)
    setHistoryLoading('idle')
    setSearchResults([])
    setSearchError(null)
    setSearchLoading('idle')
    setSelectedPlayer(null)
    setPublicGames([])
    setPublicStats(null)
    resetMatch()
  }

  const requestSignOut = () => {
    const activeMatch = roundState !== 'idle' && !winner
    setSignOutRequestedDuringMatch(activeMatch)
    setShowSignOutModal(true)
  }

  const confirmSignOut = () => {
    setShowSignOutModal(false)
    clearSession()
    setPage('login')
  }

  const cancelSignOut = () => {
    setShowSignOutModal(false)
  }

  const handleApiError = (error: unknown) => {
    const apiError = error as { message?: string; status?: number }
    const errorMessage = apiError.message || 'Request failed'
    if (apiError.status === 401) {
      clearSession()
      setAuthError('Session expired. Please log in again.')
      setPage('login')
    }
    return errorMessage
  }

  const renderSignOutModal = () => {
    if (!showSignOutModal) return null
    return (
      <div className='modal-overlay'>
        <div className='modal-card'>
          <h2>Are you sure you want to sign out?</h2>
          <p>
            {signOutRequestedDuringMatch
              ? 'Your current game will be ended if you sign out. Continue or return to your match.'
              : 'Signing out will end your session and return you to the login screen.'}
          </p>
          <div className='action-row modal-actions'>
            <button className='secondary-button' onClick={cancelSignOut}>Cancel</button>
            <button className='danger-button' onClick={confirmSignOut}>Sign Out</button>
          </div>
        </div>
      </div>
    )
  }

  const resetMatch = () => {
    setRoundState('idle')
    setCountdown(3)
    setPlayerMove(null)
    setBotMove(null)
    setResultMessage('')
    setPlayerScore(0)
    setBotScore(0)
    setWinner(null)
    setRounds([])
  }

  const handleLogin = async () => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const result = await login(username.trim(), password)
      setToken(result.token)
      setUser(result.user)
      setPage('game')
    } catch (error) {
      setAuthError((error as Error).message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleRegister = async () => {
    setAuthLoading(true)
    setAuthError(null)
    try {
      const result = await register(username.trim(), password)
      setToken(result.token)
      setUser(result.user)
      setPage('game')
    } catch (error) {
      setAuthError((error as Error).message)
    } finally {
      setAuthLoading(false)
    }
  }

  const handleMove = (move: Move) => {
    if (!isAuthenticated) {
      setAuthError('Please log in or register before playing.')
      setPage('login')
      return
    }
    setPlayerMove(move)
    setResultMessage('')
    setRoundState('countdown')
    setCountdown(3)
  }

  const addRound = (round: RoundPayload) => {
    setRounds((current) => [...current, round])
  }

  const handleSearch = async () => {
    if (!searchQuery.trim() || !token) return
    setSearchLoading('loading')
    setSearchError(null)
    setSearchResults([])
    try {
      const result = await searchPlayers(token, searchQuery.trim())
      setSearchResults(result.players)
      setSearchLoading('success')
    } catch (error) {
      setSearchError(handleApiError(error))
      setSearchLoading('error')
    }
  }

  const loadHistory = async () => {
    if (!token) return
    setHistoryLoading('loading')
    setHistoryError(null)
    try {
      const result = await fetchMyGames(token)
      setHistory(result.games)
      setHistoryLoading('success')
      setPage('history')
    } catch (error) {
      setHistoryError(handleApiError(error))
      setHistoryLoading('error')
    }
  }

  const loadPlayerPublicData = async (player: PlayerSummary) => {
    if (!token) return
    setSelectedPlayer(player)
    setPublicGames([])
    setPublicStats(null)
    try {
      const gamesResult = await fetchPlayerGames(token, player.id)
      setPublicGames(gamesResult.games)
      const statsResult = await fetchPlayerStats(token, player.id)
      setPublicStats(statsResult.stats)
      setPage('search')
    } catch (error) {
      setSearchError(handleApiError(error))
    }
  }

  useEffect(() => {
    if (roundState !== 'countdown') return
    if (countdown > 0) {
      const timer = window.setTimeout(() => setCountdown((current) => current - 1), 500)
      return () => window.clearTimeout(timer)
    }

    const fetchResult = async () => {
      if (!playerMove) return
      setGameLoading('loading')
      setGameError(null)
      try {
        const response = await playRound(playerMove)
        const round = response.result as RoundPayload
        setBotMove(round.botMove)
        setResultMessage(round.message)
        setRoundState('result')
        if (round.outcome === 'win') {
          setPlayerScore((current) => current + 1)
        } else if (round.outcome === 'lose') {
          setBotScore((current) => current + 1)
        }
        addRound(round)
        setGameLoading('success')
      } catch (error) {
        setGameError((error as Error).message)
        setGameLoading('error')
      }
    }

    fetchResult()
  }, [countdown, roundState, playerMove])

  useEffect(() => {
    if (winner && token) {
      const uploadGame = async () => {
        try {
          await saveGame(token, {
            result: winner === 'player' ? 'win' : 'lose',
            playerTally: playerScore,
            botTally: botScore,
            rounds,
          })
        } catch (error) {
          console.error('Failed saving game:', (error as Error).message)
        }
      }
      uploadGame()
    }
  }, [winner, token, playerScore, botScore, rounds])

  useEffect(() => {
    if (playerScore === 3) {
      setWinner('player')
      setRoundState('idle')
    }
    if (botScore === 3) {
      setWinner('bot')
      setRoundState('idle')
    }
  }, [playerScore, botScore])

  const renderMoveImage = (move: Move | null) => (
    <div className='move-visual'>
      {move ? <img src={moveImages[move]} alt={moveLabels[move]} /> : <span className='empty-state'>Waiting...</span>}
    </div>
  )

  const renderAuth = () => (
    <div className='title-container'>
      <div className='hero-panel'>
        <div className='hero-badge'>Player access</div>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        <div className='auth-form'>
          <label>
            Username:
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{ marginLeft: '10px', marginRight: '30px' }}  // 👈 Space before AND after
            />
            Password:
            <input
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginLeft: '10px', marginRight: '30px' }}  // 👈 Space before password input
            />
          </label>
          {authError && <p className='error-text'>{authError}</p>}
          <div className='action-row'>
            <button disabled={authLoading} onClick={handleLogin}>Log in</button>
            <button disabled={authLoading} onClick={handleRegister}>Register</button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderGame = () => (
    <div className='title-container'>
      <div className='game-shell'>
        <div className='panel-header'>
          <div className='hero-badge'>Live match</div>
          <h1 id='title'>Rock-Paper-Scissor</h1>
          <div className='player-meta'>
            <span>{user ? `Signed in as ${user.username}` : 'Not signed in'}</span>
            <button onClick={loadHistory} style={{ margin: '0 10px' }}>My History</button>
            <button onClick={() => setPage('search')} style={{ marginRight: '10px' }}>Search players</button>
            <button className='secondary-button' onClick={requestSignOut}>Sign Out</button>
          </div>
        </div>
        <div className='scoreboard'>
          <div className='score-card player-card'>
            <span>{user?.username || 'You'}</span>
            <strong>{playerScore}</strong>
            <p>{playerEmojis || ''}</p>
          </div>
          <div className='score-card bot-card'>
            <span>Bot</span>
            <strong>{botScore}</strong>
            <p>{botEmojis || ''}</p>
          </div>
        </div>
        <div className='match-status'>
          {gameError && <p className='error-text'>{gameError}</p>}
          {gameLoading === 'loading' && <p>Computing round...</p>}
          {winner && <p className='success-text'>{winner === 'player' ? 'You won the match!' : 'Bot won the match.'}</p>}
        </div>
        {roundState === 'countdown' ? (
          <div className='match-stage'>
            <div className='match-card'>
              <span className='card-label'>You</span>
              {renderMoveImage(playerMove)}
            </div>
            <div className='countdown-ring'>
              <h2 id='countdown-display'>{countdown}</h2>
            </div>
          </div>
        ) : roundState === 'result' ? (
          <>
            <div id='move-display-container'>
              <div id='move-display' className='match-card'>
                <span className='card-label'>You</span>
                {renderMoveImage(playerMove)}
              </div>
              <div id='bot-move-display' className='match-card'>
                <span className='card-label'>Bot</span>
                {renderMoveImage(botMove)}
              </div>
            </div>
            <h2 id='countdown-display'>{resultMessage}</h2>
            <div id='game-btns-container'>
              <button onClick={() => handleMove('rock')}>Rock</button>
              <button onClick={() => handleMove('paper')}>Paper</button>
              <button onClick={() => handleMove('scissor')}>Scissors</button>
            </div>
          </>
        ) : winner ? (
          <div className='action-row'>
            <button onClick={resetMatch}>Play Again</button>
            <button onClick={loadHistory}>View History</button>
          </div>
        ) : (
          <div id='game-btns-container'>
            <button onClick={() => handleMove('rock')}>Rock</button>
            <button onClick={() => handleMove('paper')}>Paper</button>
            <button onClick={() => handleMove('scissor')}>Scissors</button>
          </div>
        )}

      </div>
    </div>
  )

  const renderHistory = () => (
    <div className='title-container'>
      <div className='hero-panel'>
        <div className='hero-badge'>Game history</div>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        <div className='panel-body'>
          <div className='panel-meta-row'>
            <div>
              <p className='section-label'>Match summary</p>
              <p className='section-copy'>Review your completed games, scores, and match results.</p>
            </div>
          </div>
          <div className='panel-meta-row'>
            <div>
              <p className='section-label'>Match summary</p>
              <p className='section-copy'>Review your completed games, scores, and match results.</p>
            </div>
          </div>

          {historyLoading === 'loading' && <p className='status-text'>Loading your games...</p>}
          {historyError && <p className='error-text'>{historyError}</p>}
          {historyLoading === 'success' && history.length === 0 && (
            <p className='empty-state'>No finished games found. Play a match to save it to your history.</p>
          )}
          {history.length > 0 && (
            <section className='history-grid'>
              {history.map((game) => (
                <article key={game.id} className='history-card'>
                  <div className='history-card-header'>
                    <span className={`history-result-pill ${game.result}`}>{formatResultLabel(game.result)}</span>
                  </div>
                  <div className='history-card-body'>
                    <div className='history-stat'>
                      <span className='stat-label'>Final score</span>
                      <strong>{game.playerTally} – {game.botTally}</strong>
                    </div>
                    <div className='history-stat'>
                      <span className='stat-label'>Played on</span>
                      <time>{formatDateTime(game.createdAt)}</time>
                    </div>
                  </div>
                </article>
              ))}
            </section>
          )}
          <div className='action-row'>
            <button onClick={() => setPage('game')}>Back to game</button>
            <button onClick={() => setPage('search')}>Search players</button>
            <button className='secondary-button' onClick={requestSignOut}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSearch = () => (
    <div className='title-container'>
      <div className='hero-panel'>
        <div className='hero-badge'>Player search</div>
        <h1 id='title'>Rock-Paper-Scissor</h1>
        <div className='panel-body'>
          <div className='panel-meta-row'>
            <div>
              <p className='section-label'>Search players</p>
              <p className='section-copy'>Find other players and view their public stats.</p>
            </div>
          </div>
          <div className='search-bar'>
            <input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder='Search players by username' />
            <button disabled={searchLoading === 'loading'} onClick={handleSearch} style={{marginLeft: '10px'}}>Search</button>
          </div>
          {searchLoading === 'loading' && <p>Searching...</p>}
          {searchError && <p className='error-text'>{searchError}</p>}
          {searchResults.length > 0 && (
            <ul className='player-list'>
              {searchResults.map((player) => (
                <li key={player.id}>
                  <button onClick={() => loadPlayerPublicData(player)}>{player.username}</button>
                </li>
              ))}
            </ul>
          )}
          {selectedPlayer && publicStats && (
            <div className='player-details'>
              <div className='panel-meta-row'>
                <div>
                  <p className='section-label'>Player profile</p>
                  <h2>{selectedPlayer.username}</h2>
                </div>
                <div className='panel-meta-row'>
                </div>
              </div>
              <div className='player-stat-grid'>
                <div className='player-stat'>
                  <span className='stat-label'>Total matches</span>
                  <strong>{publicStats.totalGames}</strong>
                </div>
                <div className='player-stat'>
                  <span className='stat-label'>Wins</span>
                  <strong>{publicStats.wins}</strong>
                </div>
                <div className='player-stat'>
                  <span className='stat-label'>Losses</span>
                  <strong>{publicStats.losses}</strong>
                </div>
                <div className='player-stat'>
                  <span className='stat-label'>Ties</span>
                  <strong>{publicStats.draws}</strong>
                </div>
                <div className='player-stat'>
                  <span className='stat-label'>Win rate</span>
                  <strong>{formatWinPercentage(publicStats.winPercentage)}</strong>
                </div>
              </div>
              <div className='recent-games-section'>
                <h3>Recent public games</h3>
                {publicGames.length === 0 ? (
                  <p className='empty-state'>No public games available.</p>
                ) : (
                  <section className='history-grid'>
                    {publicGames.map((game) => (
                      <article key={game.id} className='history-card compact'>
                        <div className='history-card-header'>
                          <span className='history-card-title'>Result</span>
                          <span className={`history-result-pill ${game.result}`}>{formatResultLabel(game.result)}</span>
                        </div>
                        <div className='history-card-body'>
                          <div className='history-stat'>
                            <span className='stat-label'>Score</span>
                            <strong>{game.playerTally} – {game.botTally}</strong>
                          </div>
                          <div className='history-stat'>
                            <span className='stat-label'>Date</span>
                            <time>{new Date(game.createdAt).toLocaleDateString()}</time>
                          </div>
                        </div>
                      </article>
                    ))}
                  </section>
                )}
              </div>
            </div>
          )}
          <div className='action-row'>
            <button onClick={() => setPage('game')}>Back to game</button>
            <button onClick={loadHistory}>My history</button>
            <button className='secondary-button' onClick={requestSignOut}>Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  )

  if (!isAuthenticated) {
    return renderAuth()
  }

  if (page === 'history') return (
    <>
      {renderHistory()}
      {renderSignOutModal()}
    </>
  )

  if (page === 'search') return (
    <>
      {renderSearch()}
      {renderSignOutModal()}
    </>
  )

  return (
    <>
      {renderGame()}
      {renderSignOutModal()}
    </>
  )
}

export default App
