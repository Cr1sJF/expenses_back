// src/index.ts
import express, { Application } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import splitwiseRoutes from './routes/splitwiseRouter';


const app: Application = express();
console.log(process.env.PORT);
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Rutas
app.use('/splitwise', splitwiseRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
