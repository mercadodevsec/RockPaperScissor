const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api'

const makeHeaders = (token?: string) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  if (token) {
    headers.Authorization = `Bearer ${token}`
  }
  return headers
}

const parseResponse = async (response: Response) => {
  const payload = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = payload?.error || payload?.message || response.statusText || 'Request failed'
    const error = new Error(message)
    ;(error as any).status = response.status
    throw error
  }
  return payload
}

export type Move = 'rock' | 'paper' | 'scissor'

export interface ApiUser {
  id: string
  username: string
}

export interface RoundResult {
  playerMove: Move
  botMove: Move
  outcome: 'win' | 'lose' | 'draw'
  message: string
  roundWinner?: 'player' | 'bot'
}

export interface RoundHistoryItem extends RoundResult {
  roundNumber: number
}

export interface GameSummary {
  id: string
  result: 'win' | 'lose' | 'draw'
  playerTally: number
  botTally: number
  createdAt: string
}

export interface PlayerSummary {
  id: string
  username: string
}

export interface SearchPlayersResponse {
  players: PlayerSummary[]
}

export const login = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: makeHeaders(),
    body: JSON.stringify({ username, password }),
  })
  return parseResponse(response)
}

export const register = async (username: string, password: string) => {
  const response = await fetch(`${API_BASE}/auth/register`, {
    method: 'POST',
    headers: makeHeaders(),
    body: JSON.stringify({ username, password }),
  })
  return parseResponse(response)
}

export const playRound = async (move: Move) => {
  const response = await fetch(`${API_BASE}/game/results?move=${encodeURIComponent(move)}`)
  return parseResponse(response)
}

export const saveGame = async (
  token: string,
  payload: {
    result: 'win' | 'lose' | 'draw'
    playerTally: number
    botTally: number
    rounds: Array<{ playerMove: Move; botMove: Move; outcome: 'win' | 'lose' | 'draw' }>
  },
) => {
  const response = await fetch(`${API_BASE}/game/save`, {
    method: 'POST',
    headers: makeHeaders(token),
    body: JSON.stringify(payload),
  })
  return parseResponse(response)
}

export const fetchMyGames = async (token: string) => {
  const response = await fetch(`${API_BASE}/game/me/games`, {
    headers: makeHeaders(token),
  })
  return parseResponse(response)
}

export const fetchGameDetails = async (token: string, gameId: string) => {
  const response = await fetch(`${API_BASE}/game/${encodeURIComponent(gameId)}`, {
    headers: makeHeaders(token),
  })
  return parseResponse(response)
}

export const searchPlayers = async (token: string, username: string) => {
  const response = await fetch(`${API_BASE}/players/search?username=${encodeURIComponent(username)}`, {
    headers: makeHeaders(token),
  })
  return parseResponse(response) as Promise<SearchPlayersResponse>
}

export const fetchPlayerGames = async (token: string, playerId: string) => {
  const response = await fetch(`${API_BASE}/players/${encodeURIComponent(playerId)}/games`, {
    headers: makeHeaders(token),
  })
  return parseResponse(response)
}

export const fetchPlayerStats = async (token: string, playerId: string) => {
  const response = await fetch(`${API_BASE}/players/${encodeURIComponent(playerId)}/stats`, {
    headers: makeHeaders(token),
  })
  return parseResponse(response)
}
