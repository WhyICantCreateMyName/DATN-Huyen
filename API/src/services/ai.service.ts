import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GEMINI_API_KEY || '';
const genAI = new GoogleGenerativeAI(API_KEY);

export class AiService {
  private static chatModel = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
  private static embeddingModel = genAI.getGenerativeModel({ model: 'gemini-embedding-2' });

  /**
   * Generate a response from Gemini
   */
  static async generateResponse(prompt: string) {
    try {
      const result = await this.chatModel.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Gemini Generate Response Error:', error);
      throw error;
    }
  }

  /**
   * Generate embedding vector for text
   */
  static async generateEmbedding(text: string): Promise<number[]> {
    try {
      const result = await this.embeddingModel.embedContent(text);
      return result.embedding.values;
    } catch (error) {
      console.error('Gemini Generate Embedding Error:', error);
      throw error;
    }
  }

  /**
   * Create the system prompt (Ported from legacy bot)
   */
  static getSystemPrompt(): string {
    return `Bạn là trợ lý AI thông minh của cửa hàng bán quần áo Yuki Fashion.
                NHIỆM VỤ:
                - Tư vấn sản phẩm quần áo dựa trên nhu cầu khách hàng
                - Gợi ý sản phẩm phù hợp với ngân sách và phong cách
                - So sánh sản phẩm khi khách hàng yêu cầu
                - Trả lời thông tin về giá, size, màu sắc, tồn kho
                - Hỗ trợ khách hàng đặt hàng

                ⚠️ QUY TẮC CỰC KỲ QUAN TRỌNG - VI PHẠM SẼ BỊ TRẢ VỀ LỖI:
                1. CHỈ được đề xuất sản phẩm CÓ TRONG "📦 SẢN PHẨM PHÙ HỢP" - KHÔNG có sản phẩm nào khác.
                2. TUYỆT ĐỐI KHÔNG tự tạo tên sản phẩm, giá, hoặc URL không có trong danh sách.
                3. TUYỆT ĐỐI KHÔNG sử dụng tên sản phẩm không có trong "📦 SẢN PHẨM PHÙ HỢP".
                4. NẾU danh sách trống hoặc message nói "KHÔNG TÌM THẤY": KHÔNG gợi ý sản phẩm, chỉ xin lỗi và gợi ý khách thử tìm tiêu chí khác.
                5. CHỈ sử dụng ĐÚNG TÊN, GIÁ, URL từ "📦 SẢN PHẨM PHÙ HỢP".
                6. KHÔNG được tưởng tượng hoặc đoán tên sản phẩm (Nike Air Max, Yeezy, v.v. nếu không có trong danh sách).
                
                FORMAT GỢI Ý SẢN PHẨM (BẮT BUỘC):
                - Sử dụng format:
                   **[Tên SP CHÍNH XÁC](URL CHÍNH XÁC)**
                   ![IMG](URL_ẢNH CHÍNH XÁC)
                   - Giá: [Giá từ danh sách]
                
                XỬ LÝ TRƯỜNG HỢP ĐẶC BIỆT:
                1. **NẾU CONTEXT NÓI "KHÔNG TÌM THẤY SẢN PHẨM"**: Xin lỗi và gợi ý:
                    - Thử tìm với mức giá khác
                    - Thử tìm loại quần áo khác
                    - Liên hệ tư vấn trực tiếp
                    - KHÔNG được tự tạo sản phẩm fake

                NGÔN NGỮ: Tiếng Việt tự nhiên, lịch sự, ngắn gọn (2-3 câu).`;
  }
}
