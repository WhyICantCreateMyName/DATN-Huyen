import { Router, Response, Request } from 'express';
import multer from 'multer';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { authenticate, AuthRequest } from '../middleware/auth.middleware';
import { successResponse, errorResponse, ErrorResponses } from '../utils/response';
import { ReplicateService } from '../services/replicate.service';
import { getBaseUrl, toAbsoluteUrls } from '../utils/url';
import fs from 'fs';

const router = Router();

// Helper to upload a file to a temporary public hosting (litterbox.catbox.moe)
// Files will be automatically deleted after 1 hour
async function uploadToPublic(filePath: string): Promise<string> {
  try {
    const fileBuffer = fs.readFileSync(filePath);
    const formData = new FormData();
    formData.append('reqtype', 'fileupload');
    formData.append('time', '1h');
    formData.append('fileToUpload', new Blob([fileBuffer]), path.basename(filePath));

    const response = await fetch('https://litterbox.catbox.moe/resources/internals/api.php', {
      method: 'POST',
      body: formData
    });

    if (!response.ok) throw new Error('Upload failed');
    return await response.text();
  } catch (error) {
    console.error('Temporary public upload error:', error);
    return '';
  }
}

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
    let finalGarmentUrl = absoluteGarmentUrls[0];

    // CRITICAL: Ensure URLs sent to Replicate are public (no localhost)
    if (finalHumanImageUrl.includes('localhost') && process.env.BASE_URL) {
      finalHumanImageUrl = finalHumanImageUrl.replace(/http:\/\/localhost:\d+/, process.env.BASE_URL);
    }
    if (finalGarmentUrl.includes('localhost') && process.env.BASE_URL) {
      finalGarmentUrl = finalGarmentUrl.replace(/http:\/\/localhost:\d+/, process.env.BASE_URL);
    }

    // CRITICAL: Upload to public hosting to bypass ngrok issues
    console.log('🔄 Uploading images to public storage for Replicate access...');
    
    let publicHumanUrl = finalHumanImageUrl;
    if (humanImageFile) {
      const uploaded = await uploadToPublic(humanImageFile.path);
      if (uploaded) publicHumanUrl = uploaded;
    }

    let publicGarmentUrl = finalGarmentUrl;
    if (finalGarmentUrl.includes('/api/uploads/')) {
      const fileName = finalGarmentUrl.split('/api/uploads/')[1];
      const localPath = path.join('public/uploads', fileName);
      if (fs.existsSync(localPath)) {
        const uploaded = await uploadToPublic(localPath);
        if (uploaded) publicGarmentUrl = uploaded;
      }
    }

    console.log('--- [VTO DEBUG] Sending to Replicate ---');
    console.log('Public Human Image:', publicHumanUrl);
    console.log('Public Garment Image:', publicGarmentUrl);

    const result = await ReplicateService.virtualTryOn(publicHumanUrl, publicGarmentUrl, description, category);

    console.log('--- [VTO DEBUG] Success ---');
    console.log('Generated Result URL (AI):', result ? ((result as string).length > 100 ? (result as string).substring(0, 100) + '...' : result) : 'NULL');

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