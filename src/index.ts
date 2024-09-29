// src/index.ts
import express, { Application } from 'express';
import dotenv from 'dotenv';
dotenv.config();
import splitwiseRoutes from './routes/splitwiseRouter';
import cors from 'cors';

const app: Application = express();
console.log(process.env.PORT);
const port = process.env.PORT || 3000;

// Middlewares
app.use(express.json());

// Configurar CORS
const corsOptions = {
  origin: '*', // Reemplaza con el dominio de tu frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Métodos HTTP permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
};

app.use(cors(corsOptions));

// Rutas
app.use('/splitwise', splitwiseRoutes);

// Iniciar el servidor
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
