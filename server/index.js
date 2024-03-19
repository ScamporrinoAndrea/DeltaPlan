'use strict';
import dotenv from 'dotenv';
dotenv.config();
import express, { json } from 'express';
import cors from 'cors';
import router from './routes/route.js';

const app = express();
const port = process.env.PORT || 3001;

const corsOptions = {
  origin: [`http://${process.env.NET_IP}:5173`, 'http://localhost:5173'],
  credentials: true,
};

app.use(cors(corsOptions));
app.use(json());
app.use('/api', router);
app.use(express.static('public'));

export { app, port };