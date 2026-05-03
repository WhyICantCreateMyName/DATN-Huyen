import { QdrantClient } from '@qdrant/js-client-rest';
import { AiService } from './ai.service';
import prisma from '../lib/prisma';
import dotenv from 'dotenv';

dotenv.config();

const QDRANT_URL = process.env.QDRANT_URL || 'http://localhost:6333';
const COLLECTION_NAME = 'products';

export class QdrantService {
  private static client = new QdrantClient({ url: QDRANT_URL });

  /**
   * Initialize collection if it doesn't exist
   */
  static async initCollection() {
    try {
      const collections = await this.client.getCollections();
      const exists = collections.collections.some((c) => c.name === COLLECTION_NAME);

      if (!exists) {
        console.log(`Creating Qdrant collection: ${COLLECTION_NAME}`);
        // Gemini text-embedding-004 has 768 dimensions
        await this.client.createCollection(COLLECTION_NAME, {
          vectors: { size: 768, distance: 'Cosine' },
        });
      }
    } catch (error) {
      console.error('Qdrant Init Error:', error);
    }
  }

  /**
   * Create text representation of a product for embedding
   */
  private static createProductText(product: any): string {
    const parts = [];
    if (product.name) parts.push(`Tên: ${product.name}`);
    if (product.category?.name) parts.push(`Danh mục: ${product.category.name}`);
    if (product.description) parts.push(`Mô tả: ${product.description}`);
    
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map((v: any) => parseFloat(v.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        parts.push(`Giá: ${minPrice.toLocaleString('vi-VN')}đ`);
      } else {
        parts.push(`Giá: ${minPrice.toLocaleString('vi-VN')}đ - ${maxPrice.toLocaleString('vi-VN')}đ`);
      }

      const sizes = [...new Set(product.variants.map((v: any) => v.size))];
      parts.push(`Size: ${sizes.join(', ')}`);

      const colors = [...new Set(product.variants.map((v: any) => v.color))];
      parts.push(`Màu: ${colors.join(', ')}`);
    }

    return parts.join(' | ');
  }

  /**
   * Index all products into Qdrant
   */
  static async indexAllProducts() {
    try {
      await this.initCollection();

      const products = await prisma.product.findMany({
        include: {
          category: true,
          variants: true,
        },
      });

      console.log(`Indexing ${products.length} products into Qdrant...`);

      const points = [];
      for (const product of products) {
        const text = this.createProductText(product);
        const vector = await AiService.generateEmbedding(text);

        points.push({
          id: product.id,
          vector: vector,
          payload: {
            id: product.id,
            name: product.name,
            description: product.description,
            categoryId: product.categoryId,
            categoryName: product.category?.name,
          },
        });
      }

      if (points.length > 0) {
        await this.client.upsert(COLLECTION_NAME, {
          wait: true,
          points: points,
        });
      }

      console.log('✅ Qdrant indexing complete.');
    } catch (error) {
      console.error('Qdrant Indexing Error:', error);
      throw error;
    }
  }

  /**
   * Search for products using semantic search
   */
  static async searchProducts(query: string, limit: number = 5) {
    try {
      await this.initCollection();
      const vector = await AiService.generateEmbedding(query);

      const results = await this.client.search(COLLECTION_NAME, {
        vector: vector,
        limit: limit,
        with_payload: true,
      });

      return results.map((hit) => hit.payload);
    } catch (error) {
      console.error('Qdrant Search Error:', error);
      return [];
    }
  }
}
