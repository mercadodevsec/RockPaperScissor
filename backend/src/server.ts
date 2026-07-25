import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import GameEngine, { type Move } from './game/GameEngine.js';

// import db from './database/connection.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/game', (req, res) => {
  const move = req.query.move?.toString().toLowerCase();
  const validMoves: Move[] = ['rock', 'paper', 'scissor'];

  if (!move || !validMoves.includes(move as Move)) {
    return res.status(400).json({
      message: 'Please provide a valid move query parameter: rock, paper, or scissor',
    });
  }

  const computerMove = GameEngine.getComputerMove();
  const result = GameEngine.determineRoundResult(move as Move, computerMove);

  return res.json({
    result
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

