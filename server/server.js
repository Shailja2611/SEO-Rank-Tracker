import express from 'express';
import cors from 'cors';
import "dotenv/config";
import connectDB from './config/db.js';
import authRouter from './routes/authRoutes.js';
import rankRouter from './routes/rankRoute.js';

connectDB()  


const app= express();

app.use(cors());
app.use(express.json());

app.get('/',(req,res)=> res.send("server is running"));
app.use('/api/auth', authRouter);
app.use('/api/rank', rankRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT,()=> console.log(`server is running on port ${PORT}`));