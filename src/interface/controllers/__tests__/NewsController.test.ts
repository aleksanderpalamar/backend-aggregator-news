import { Request, Response } from 'express';
import { NewsController } from '../NewsController';
import { NewsService } from '../../../applications/services/NewsService';
import { CacheService } from '../../../infrastructure/cache/CacheService';
import { News } from '../../../domain/entities/News';
import { NewsResumeDTO } from '../../../applications/dtos/NewsDTO';

// Mock NewsService
class MockNewsService implements NewsService {
  async listNews(): Promise<NewsResumeDTO[]> {
    return [
      {
        id: '1',
        title: 'Test News 1',
        resume: 'This is a test news resume',
        datePublished: new Date('2023-01-01'),
        source: 'Test Source',
        urlImages: 'https://example.com/image.jpg'
      }
    ];
  }

  async getNewsById(id: string): Promise<News | null> {
    if (id === '1') {
      return {
        id: '1',
        title: 'Test News 1',
        content: 'This is the content of test news',
        resume: 'This is a test news resume',
        datePublished: new Date('2023-01-01'),
        source: 'Test Source',
        author: 'Test Author',
        categories: ['test'],
        urlImages: 'https://example.com/image.jpg',
        urlOriginal: 'https://example.com/news/1'
      };
    }
    return null;
  }

  async updatedCacheNews(): Promise<void> {
    return Promise.resolve();
  }
}

describe('NewsController', () => {
  let controller: NewsController;
  let mockNewsService: NewsService;
  let mockCacheService: CacheService;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let jsonSpy: jest.Mock;

  beforeEach(() => {
    mockNewsService = new MockNewsService();
    mockCacheService = new CacheService();
    
    controller = new NewsController(mockNewsService, mockCacheService);
    
    jsonSpy = jest.fn();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jsonSpy
    } as Partial<Response>;
  });

  describe('listingNews', () => {
    it('should return news list with default parameters', async () => {
      mockRequest = {
        query: {}
      };
      
      await controller.listingNews(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          title: 'Test News 1'
        })
      ]));
    });
    
    it('should parse query parameters correctly', async () => {
      mockRequest = {
        query: {
          categoria: 'tech',
          search: 'test',
          page: '2',
          quantity: '5'
        }
      };
      
      const spyListNews = jest.spyOn(mockNewsService, 'listNews');
      
      await controller.listingNews(mockRequest as Request, mockResponse as Response);
      
      expect(spyListNews).toHaveBeenCalledWith({
        categories: 'tech',
        term: 'test',
        page: 2,
        quantity: 5
      });
    });
  });
  
  describe('getNewsById', () => {
    it('should return a news item when found', async () => {
      mockRequest = {
        params: { id: '1' }
      };
      
      await controller.getNewsById(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        id: '1',
        title: 'Test News 1',
        content: 'This is the content of test news'
      }));
    });
    
    it('should return 404 when news is not found', async () => {
      mockRequest = {
        params: { id: 'non-existent' }
      };
      
      await controller.getNewsById(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(jsonSpy).toHaveBeenCalledWith(expect.objectContaining({
        erro: 'News not found'
      }));
    });
  });
});