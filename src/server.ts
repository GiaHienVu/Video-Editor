import express from 'express';
import dotenv from 'dotenv';
import authRoutes from './presentation/routes/auth.routes';
import videRoutes from './presentation/routes/video.routes';
import path from 'path';
import { verifyToken } from '@presentation/middleware/auth.middleware';
dotenv.config();
const app = express();
app.set('json replacer', (_k, v) => (typeof v === 'bigint' ? v.toString() : v));

app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/auth', authRoutes);
app.use('/upload', verifyToken, videRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));


