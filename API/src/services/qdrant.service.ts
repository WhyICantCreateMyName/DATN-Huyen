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
   * Initialize collection if it doesn't exist or has wrong dimensions
   */
  static async initCollection() {
    try {
      const collections = await this.client.getCollections();
      const collectionInfo = collections.collections.find((c) => c.name === COLLECTION_NAME);
      
      const NEW_VECTOR_SIZE = 3072; // gemini-embedding-2 dimension

      if (collectionInfo) {
        // Check current dimension
        const detail = await this.client.getCollection(COLLECTION_NAME);
        const currentSize = (detail.config?.params?.vectors as any)?.size;
        
        if (currentSize !== NEW_VECTOR_SIZE) {
          console.log(`⚠️ Dimension mismatch (${currentSize} vs ${NEW_VECTOR_SIZE}). Recreating collection...`);
          await this.client.deleteCollection(COLLECTION_NAME);
          await this.client.createCollection(COLLECTION_NAME, {
            vectors: { size: NEW_VECTOR_SIZE, distance: 'Cosine' },
          });
        }
      } else {
        console.log(`Creating Qdrant collection: ${COLLECTION_NAME}`);
        await this.client.createCollection(COLLECTION_NAME, {
          vectors: { size: NEW_VECTOR_SIZE, distance: 'Cosine' },
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
    if (product.name) parts.push(`Tên sản phẩm: ${product.name}`);
    if (product.category?.name) parts.push(`Danh mục: ${product.category.name}`);
    if (product.description) parts.push(`Mô tả: ${product.description}`);
    
    if (product.variants && product.variants.length > 0) {
      const prices = product.variants.map((v: any) => parseFloat(v.price));
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      if (minPrice === maxPrice) {
        parts.push(`Giá: ${minPrice.toLocaleString('vi-VN')}đ`);
      } else {
        parts.push(`Giá dao động: ${minPrice.toLocaleString('vi-VN')}đ - ${maxPrice.toLocaleString('vi-VN')}đ`);
      }

      const sizes = [...new Set(product.variants.map((v: any) => v.size))];
      parts.push(`Size có sẵn: ${sizes.join(', ')}`);

      const colors = [...new Set(product.variants.map((v: any) => v.color))];
      parts.push(`Màu sắc: ${colors.join(', ')}`);
      
      const totalStock = product.variants.reduce((sum: number, v: any) => sum + v.stock, 0);
      parts.push(`Trạng thái: ${totalStock > 0 ? 'Còn hàng' : 'Hết hàng'}`);
    }

    return parts.join(' | ');
  }

  /**
   * Index all products into Qdrant
   */
  static async indexAllProducts(force: boolean = false) {
    try {
      await this.initCollection();

      // 1. Check current count in Qdrant vs Database
      const [products, collectionDetail] = await Promise.all([
        prisma.product.findMany({
          include: { category: true, variants: true },
        }),
        this.client.getCollection(COLLECTION_NAME)
      ]);

      const currentCount = collectionDetail.points_count || 0;
      
      if (!force && products.length > 0 && currentCount === products.length) {
        console.log(`ℹ️ Qdrant already has ${currentCount} products indexed. Skipping re-indexing...`);
        return;
      }

      if (products.length === 0) {
        console.log('No products found to index.');
        return;
      }

      console.log(`🚀 Indexing ${products.length} products into Qdrant (Force: ${force})...`);

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
            images: product.images,
            minPrice: product.variants.length > 0 ? Math.min(...product.variants.map((v: any) => parseFloat(v.price))) : 0,
            maxPrice: product.variants.length > 0 ? Math.max(...product.variants.map((v: any) => parseFloat(v.price))) : 0,
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
      console.error('❌ Qdrant Indexing Error:', error);
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
