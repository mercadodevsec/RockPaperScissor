import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import gameRoutes from './routes/gameRoutes.ts'

// import db from './database/connection.js'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Routers
app.use('/api/game', gameRoutes)



// app.get()

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

