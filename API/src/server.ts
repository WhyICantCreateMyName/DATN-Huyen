import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

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
import purchaseController from './controllers/purchase.controller';
import userController from './controllers/user.controller';
import customerController from './controllers/customer.controller';
import adminMessageController from './controllers/admin-message.controller';
import messageController from './controllers/message.controller';
import bannerController from './controllers/banner.controller';
import paymentController from './controllers/payment.controller';
import uploadController from './controllers/upload.controller';
import variantController from './controllers/variant.controller';
import wishlistController from './controllers/wishlist.controller';
import reviewController from './controllers/review.controller';

const allowedOrigins = process.env.CORS_ORIGIN 
    ? process.env.CORS_ORIGIN.split(',') 
    : ['http://localhost:3000', 'http://localhost:4000'];

const app = express();
const httpServer = createServer(app);
const io = new SocketIOServer(httpServer, {
    cors: {
        origin: allowedOrigins,
        methods: ['GET', 'POST'],
    },
});

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/uploads', express.static('public/uploads'));

// Public & Shared Routes
app.use('/api/auth', authController);
app.use('/api/categories', categoryController);
app.use('/api/products', productController);
app.use('/api/cart', cartController);
app.use('/api/orders', orderController);
app.use('/api/messages', messageController);
app.use('/api/banners', bannerController);
app.use('/api/payment', paymentController);
app.use('/api/upload', uploadController);
app.use('/api/wishlist', wishlistController);
app.use('/api/reviews', reviewController);

// Admin Routes
app.use('/api/admin/variants', variantController);
app.use('/api/admin/customers', customerController);
app.use('/api/admin/purchase-invoices', purchaseController);
app.use('/api/admin/users', userController);
app.use('/api/admin/messages', adminMessageController);
app.use('/api/admin', adminController);

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

    socket.on('message', async (data) => {
        const { senderId, receiverId, content, senderType } = data;

        try {
            const newMessage = await prisma.message.create({
                data: {
                    senderId,
                    receiverId,
                    content,
                    senderType: senderType || 'USER',
                }
            });

            io.to(`user:${receiverId}`).emit('message', newMessage);
            console.log(`Message from ${senderId} to ${receiverId} persisted and emitted`);
        } catch (error) {
            console.error('Socket message error:', error);
        }
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
});

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        await prisma.$connect();
        console.log('✅ Prisma connected to PostgreSQL successfully.');

        // Initialize AI Search (Qdrant)
        try {
            const { QdrantService } = require('./services/qdrant.service');
            console.log('🤖 Initializing AI Search Service...');
            
            if (process.env.SKIP_AI_INDEXING === 'true') {
                console.log('ℹ️ AI Indexing skipped via environment variable.');
            } else {
                await QdrantService.indexAllProducts();
            }
        } catch (aiError) {
            console.error('⚠️ Warning: AI Search Service failed to initialize:', aiError);
            console.log('   (Continuing server startup without AI search)');
        }

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
