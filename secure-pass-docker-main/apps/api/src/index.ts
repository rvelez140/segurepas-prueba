import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import passport from './config/passport';
import visitRoutes from './routes/visitRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/authRoutes';
import verificationRoutes from './routes/verificationRoutes';
import companyRoutes from './routes/companyRoutes';
import subscriptionRoutes from './routes/subscriptionRoutes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(passport.initialize());

const MONGODB_URI = process.env.MONGODB_URI || '';
const PORT = process.env.PORT || 8000;

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log('Se ha realizado la conexión con MongoDB'))
  .catch((err: Error) => console.error('Error al conectar a Mongo: ', err));

app.use('/api', visitRoutes, userRoutes, authRoutes, verificationRoutes, subscriptionRoutes);
app.use('/api/companies', companyRoutes);

app.get('/', (req, res) => {
  res.send(
    `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>SecurePass</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f5f5f5;
            display: flex;
            justify-content: center;
            align-items: center;
            height: 100vh;
            margin: 0;
        }
        
        .securepass-container {
            border: 2px solid #3498db;
            border-radius: 10px;
            padding: 30px;
            text-align: center;
            background-color: white;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
            max-width: 300px;
            width: 100%;
        }
        
        .securepass-title {
            color: #2c3e50;
            font-size: 24px;
            font-weight: bold;
            margin-bottom: 20px;
        }
        
        .securepass-logo {
            color: #3498db;
            font-size: 36px;
            margin-bottom: 15px;
        }
        
        .securepass-description {
            color: #7f8c8d;
            font-size: 14px;
            margin-top: 15px;
        }
    </style>
</head>
<body>
    <div class="securepass-container">
        <div class="securepass-logo">🔐</div>
        <div class="securepass-title">SECURE PASS API</div>
        <div class="securepass-description">El servidor está funcionando correctamente</div>
    </div>
</body>
</html>`
  );
});

app.listen(PORT, () => {
  console.log('Servidor corriendo en Puerto: ', PORT);
});
