import { Router, Response, Request } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { successResponse, errorResponse, ErrorResponses } from '../utils/response';
import { ReplicateService } from '../services/replicate.service';
import { getBaseUrl, toAbsoluteUrls } from '../utils/url';

const router = Router();

// Configure multer for VTO (similar to upload controller)
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_DIR || 'public/uploads');
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `vto-${uuidv4()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE || '5242880'), // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ chấp nhận file ảnh (jpeg, jpg, png, webp)'));
    }
  },
});

/**
 * POST /api/vto
 * Perform virtual try-on
 * Form-data: 
 * - humanImage: File (User photo)
 * - garmentImage: string (URL or local path of clothing)
 * - description: string (Garment description)
 */
router.post('/', authenticate, upload.single('humanImage'), async (req: AuthRequest, res: Response) => {
  try {
    const humanImageFile = req.file;
    const { humanImage, garmentImage, description, category } = req.body;

    let finalHumanImageUrl = '';

    if (humanImageFile) {
      const baseUrl = getBaseUrl(req);
      finalHumanImageUrl = `${baseUrl}/api/uploads/${humanImageFile.filename}`;
    } else if (humanImage) {
      const baseUrl = getBaseUrl(req);
      const absoluteUrls = toAbsoluteUrls([humanImage], baseUrl);
      finalHumanImageUrl = absoluteUrls[0];
    } else {
      return errorResponse(res, 'Vui lòng cung cấp ảnh người mẫu (humanImage) dưới dạng file hoặc URL', 400);
    }

    if (!garmentImage) {
      return errorResponse(res, 'Vui lòng cung cấp ảnh sản phẩm (garmentImage)', 400);
    }

    const baseUrl = getBaseUrl(req);
    const absoluteGarmentUrls = toAbsoluteUrls([garmentImage], baseUrl);
    const finalGarmentUrl = absoluteGarmentUrls[0];

    console.log('--- New VTO Request (Multipart) ---');
    console.log('Human Image URL:', finalHumanImageUrl);
    console.log('Garment Image URL:', finalGarmentUrl);
    console.log('Category:', category || 'upper_body');

    const result = await ReplicateService.virtualTryOn(finalHumanImageUrl, finalGarmentUrl, description, category);

    return successResponse(res, {
      imageUrl: result,
      message: 'Virtual Try-on completed successfully'
    });
  } catch (error: any) {
    console.error('VTO Controller Error:', error);
    return errorResponse(res, error.message || 'Lỗi xử lý AI Thử đồ', 500);
  }
});

/**
 * POST /api/vto/mock
 * Mock endpoint for frontend testing (doesn't call Replicate)
 */
router.post('/mock', authenticate, upload.single('humanImage'), async (req: AuthRequest, res: Response) => {
  try {
    const humanImageFile = req.file;
    const { humanImage, garmentImage, description, category } = req.body;

    let finalHumanImageUrl = '';
    const baseUrl = getBaseUrl(req);

    if (humanImageFile) {
      finalHumanImageUrl = `${baseUrl}/api/uploads/${humanImageFile.filename}`;
    } else if (humanImage) {
      const absoluteUrls = toAbsoluteUrls([humanImage], baseUrl);
      finalHumanImageUrl = absoluteUrls[0];
    }

    console.log('--- VTO MOCK REQUEST ---');
    console.log('Human Image (Full URL):', finalHumanImageUrl);
    console.log('Garment Image:', garmentImage);
    console.log('Category:', category || 'upper_body');
    console.log('Description:', description);

    // Simulate delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    return successResponse(res, {
      imageUrl: 'https://raw.githubusercontent.com/yisol/IDM-VTON/main/example/human/00001_00.jpg',
      message: 'MOCK: Virtual Try-on completed successfully'
    });
  } catch (error: any) {
    return errorResponse(res, 'Lỗi Mock VTO', 500);
  }
});

export default router;
