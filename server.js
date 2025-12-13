import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import cookieParser from 'cookie-parser';
import connectDB from './src/config/db.js ';
import authRoutes from './src/routes/authRoutes.js';
const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

app.use(express.json());
app.use(cookieParser());

// CORS
app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
}));

// API Endpoints
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.use('/api/auth', authRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});
