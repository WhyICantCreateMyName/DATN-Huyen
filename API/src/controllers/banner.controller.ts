import express from 'express';
import prisma from '../lib/prisma';
import { authenticate, isAdmin } from '../middleware/auth.middleware';

const router = express.Router();

// Get all sliders (public - only active)
router.get('/', async (req, res) => {
    try {
        const sliders = await prisma.bannerSlider.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: sliders });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Admin: Get all sliders including inactive
router.get('/admin', authenticate, isAdmin, async (req, res) => {
    try {
        const sliders = await prisma.bannerSlider.findMany({
            orderBy: { createdAt: 'desc' }
        });
        res.json({ success: true, data: sliders });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Admin: Create slider
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        const slider = await prisma.bannerSlider.create({
            data: {
                name: req.body.name || "Main Slider",
                items: req.body.items || [],
                isActive: req.body.isActive !== undefined ? req.body.isActive : true
            }
        });
        res.json({ success: true, data: slider });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Admin: Update slider
router.put('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const slider = await prisma.bannerSlider.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json({ success: true, data: slider });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Admin: Delete slider
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        await prisma.bannerSlider.delete({
            where: { id: req.params.id }
        });
        res.json({ success: true, message: 'Slider deleted' });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

export default router;
