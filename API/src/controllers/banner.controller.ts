import express from 'express';
import prisma from '../lib/prisma';
import { authenticate, isAdmin } from '../middleware/auth.middleware';
import { toAbsoluteUrls, getBaseUrl, toRelativePaths } from '../utils/url';

const router = express.Router();

// Get all sliders (public - only active)
router.get('/', async (req, res) => {
    try {
        const sliders = await prisma.bannerSlider.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });

        const baseUrl = getBaseUrl(req);
        const formattedSliders = sliders.map(slider => ({
            ...slider,
            items: (slider.items as any[]).map(item => ({
                ...item,
                image: toAbsoluteUrls([item.image], baseUrl)[0]
            }))
        }));

        res.json({ success: true, data: formattedSliders });
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

        const baseUrl = getBaseUrl(req);
        const formattedSliders = sliders.map(slider => ({
            ...slider,
            items: (slider.items as any[]).map(item => ({
                ...item,
                image: toAbsoluteUrls([item.image], baseUrl)[0]
            }))
        }));

        res.json({ success: true, data: formattedSliders });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Admin: Create slider
router.post('/', authenticate, isAdmin, async (req, res) => {
    try {
        const items = req.body.items || [];
        const relativeItems = items.map((item: any) => ({
            ...item,
            image: toRelativePaths([item.image])[0]
        }));

        const slider = await prisma.bannerSlider.create({
            data: {
                name: req.body.name || "Main Slider",
                items: relativeItems,
                isActive: req.body.isActive !== undefined ? req.body.isActive : true
            }
        });
        const baseUrl = getBaseUrl(req);
        const formattedSlider = {
            ...slider,
            items: (slider.items as any[]).map(item => ({
                ...item,
                image: toAbsoluteUrls([item.image], baseUrl)[0]
            }))
        };
        res.json({ success: true, data: formattedSlider });
    } catch (error) {
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// Admin: Update slider
router.put('/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const updateData = { ...req.body };
        if (updateData.items) {
            updateData.items = updateData.items.map((item: any) => ({
                ...item,
                image: toRelativePaths([item.image])[0]
            }));
        }

        const slider = await prisma.bannerSlider.update({
            where: { id: req.params.id },
            data: updateData
        });
        const baseUrl = getBaseUrl(req);
        const formattedSlider = {
            ...slider,
            items: (slider.items as any[]).map(item => ({
                ...item,
                image: toAbsoluteUrls([item.image], baseUrl)[0]
            }))
        };
        res.json({ success: true, data: formattedSlider });
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
