/**
 * Ported helper functions for AI Chatbot logic
 */

export interface Intent {
  type: 'general' | 'product_search' | 'compare' | 'order' | 'support';
  sentiment: 'positive' | 'neutral' | 'negative';
  requires_human: boolean;
  keywords: string[];
}

/**
 * Extract budget from message (min, max) - Ported from legacy bot
 */
export function extractBudget(message: string): { min: number | null; max: number | null } {
  const messageLower = message.toLowerCase();
  let minPrice: number | null = null;
  let maxPrice: number | null = null;

  // Helper to convert units
  const convertAmount = (amount: string, unit: string) => {
    const val = parseFloat(amount);
    if (unit === 'triệu' || unit === 'tr') return val * 1000000;
    if (unit === 'nghìn' || unit === 'ngàn' || unit === 'k') return val * 1000;
    return val;
  };

  // Pattern: "dưới X triệu/tr/nghìn"
  const underMatch = messageLower.match(/(?:dưới|không quá|tối đa)\s*(\d+(?:\.\d+)?)\s*(triệu|tr|nghìn|ngàn|k)/);
  if (underMatch) {
    maxPrice = convertAmount(underMatch[1], underMatch[2]);
  }

  // Pattern: "trên X triệu/tr/nghìn"
  const overMatch = messageLower.match(/(?:trên|từ|ít nhất)\s*(\d+(?:\.\d+)?)\s*(triệu|tr|nghìn|ngàn|k)/);
  if (overMatch) {
    minPrice = convertAmount(overMatch[1], overMatch[2]);
  }

  // Pattern: "từ X đến Y"
  const rangeMatch = messageLower.match(/(?:từ\s*)?(\d+(?:\.\d+)?)\s*(?:đến|-)\s*(\d+(?:\.\d+)?)\s*(triệu|tr|nghìn|ngàn|k)/);
  if (rangeMatch) {
    minPrice = convertAmount(rangeMatch[1], rangeMatch[3]);
    maxPrice = convertAmount(rangeMatch[2], rangeMatch[3]);
  }

  return { min: minPrice, max: maxPrice };
}

/**
 * Analyze intent (Rule-based) - Ported from legacy bot
 */
export function analyzeIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase();
  
  const intent: Intent = {
    type: 'general',
    sentiment: 'neutral',
    requires_human: false,
    keywords: []
  };

  const hasProductKeyword = /giày|sneaker|áo|quần|váy|đầm|phụ kiện|nam|nữ|thể thao/.test(lowerMessage);
  const hasSearchAction = /tìm|kiếm|có|muốn mua|xem|giá|gợi ý|tư vấn|phù hợp/.test(lowerMessage);

  if (hasProductKeyword && (hasSearchAction || lowerMessage.split(/\s+/).length <= 10)) {
    intent.type = 'product_search';
  } else if (/so sánh|khác nhau|nào tốt hơn/.test(lowerMessage)) {
    intent.type = 'compare';
  } else if (/đặt hàng|mua|thanh toán|vận chuyển/.test(lowerMessage)) {
    intent.type = 'order';
  } else if (/khiếu nại|hoàn tiền|đổi trả|bị lỗi/.test(lowerMessage)) {
    intent.type = 'support';
    intent.requires_human = true;
    intent.sentiment = 'negative';
  }

  const productKeywords = ["giày", "áo", "quần", "váy", "đầm", "nam", "nữ", "thể thao", "cao cấp"];
  intent.keywords = productKeywords.filter(kw => lowerMessage.includes(kw));

  return intent;
}
