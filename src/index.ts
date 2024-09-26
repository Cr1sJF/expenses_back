// src/index.ts
import express, { Application } from 'express';
import splitwiseRoutes from './routes/splitwiseRouter';

const app: Application = express();
const port = 3000;

// Middlewares
app.use(express.json());

// Rutas
app.use('/splitwise', splitwiseRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
