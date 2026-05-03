import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import prisma from './lib/prisma';

// Import Controllers
import authController from './controllers/auth.controller';
import categoryController from './controllers/category.controller';
import productController from './controllers/product.controller';
import cartController from './controllers/cart.controller';
import orderController from './controllers/order.controller';
import adminController from './controllers/admin.controller';
import chatController from './controllers/chat.controller';
import paymentController from './controllers/payment.controller';
import uploadController from './controllers/upload.controller';
import variantController from './controllers/variant.controller';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/uploads', express.static('public/uploads'));

app.use('/api/auth', authController);
app.use('/api/categories', categoryController);
app.use('/api/products', productController);
app.use('/api/cart', cartController);
app.use('/api/orders', orderController);
app.use('/api/admin/variants', variantController);
app.use('/api/admin', adminController);
app.use('/api/messages', chatController);
app.use('/api/payment', paymentController);
app.use('/api/upload', uploadController);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date(), database: 'connected' });
});

// Socket.IO Logic
io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join', (userId: string) => {
        socket.join(`user:${userId}`);
        console.log(`User ${userId} joined room`);
    });

    socket.on('message', (data) => {
        const { receiverId, message } = data;
        io.to(`user:${receiverId}`).emit('message', message);
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Test database connection
        await prisma.$connect();
        console.log('✅ Prisma connected to SQL Server successfully.');

        httpServer.listen(PORT, () => {
            console.log(`🚀 API Server is running on http://localhost:${PORT}`);
            console.log(`🏥 Health check: http://localhost:${PORT}/health`);
        });
    } catch (error) {
        console.error('❌ Unable to start server:', error);
        process.exit(1);
    }
}

startServer();

export { io };
