import request from 'supertest';
import express from 'express';
import { createNewsRoutes } from '../newsRoutes';
import { NewsService } from '../../../applications/services/NewsService';
import { CacheService } from '../../../infrastructure/cache/CacheService';
import { News } from '../../../domain/entities/News';
import { NewsResumeDTO } from '../../../applications/dtos/NewsDTO';

// Mock implementation of the NewsService
class MockNewsService implements NewsService {
  async listNews(): Promise<NewsResumeDTO[]> {
    return [
      {
        id: '1',
        title: 'Test News 1',
        resume: 'Test resume 1',
        datePublished: new Date('2023-01-01'),
        source: 'Test Source 1',
        urlImages: 'https://example.com/image1.jpg'
      },
      {
        id: '2',
        title: 'Test News 2',
        resume: 'Test resume 2',
        datePublished: new Date('2023-01-02'),
        source: 'Test Source 2',
        urlImages: 'https://example.com/image2.jpg'
      }
    ];
  }

  async getNewsById(id: string): Promise<News | null> {
    if (id === '1') {
      return {
        id: '1',
        title: 'Test News 1',
        content: 'Test content 1',
        resume: 'Test resume 1',
        datePublished: new Date('2023-01-01'),
        source: 'Test Source 1',
        author: 'Test Author 1',
        categories: ['tech'],
        urlImages: 'https://example.com/image1.jpg',
        urlOriginal: 'https://example.com/news/1'
      };
    }
    return null;
  }

  async updatedCacheNews(): Promise<void> {
    return Promise.resolve();
  }
}

describe('News Routes', () => {
  let app: express.Application;
  let mockNewsService: NewsService;
  let cacheService: CacheService;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    mockNewsService = new MockNewsService();
    cacheService = new CacheService();
    
    // Create and apply routes
    app.use('/api', createNewsRoutes(mockNewsService, cacheService));
  });

  describe('GET /news', () => {
    it('should return a list of news', async () => {
      const response = await request(app).get('/api/news');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('id', '1');
      expect(response.body[1]).toHaveProperty('id', '2');
    });

    it('should accept query parameters', async () => {
      const response = await request(app)
        .get('/api/news')
        .query({ 
          categoria: 'tech',
          search: 'test',
          page: 2,
          quantity: 5
        });
      
      expect(response.status).toBe(200);
    });
  });

  describe('GET /news/:id', () => {
    it('should return a single news item when it exists', async () => {
      const response = await request(app).get('/api/news/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('id', '1');
      expect(response.body).toHaveProperty('title', 'Test News 1');
      expect(response.body).toHaveProperty('content', 'Test content 1');
    });

    it('should return 404 when news does not exist', async () => {
      const response = await request(app).get('/api/news/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('erro', 'News not found');
    });
  });
});