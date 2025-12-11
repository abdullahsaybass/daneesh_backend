import express from 'express';
import cors from 'cors';
import 'dotenv/config.js';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({credentials: true, 
    origin: 'http://localhost:3000'
}));

app.get('/', (req, res) => 
    res.send('Hello World!'));
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)});
