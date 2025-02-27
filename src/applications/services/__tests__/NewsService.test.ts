import { NewsServiceImpl } from '../NewsService';
import { NewsRepository } from '../../../domain/entities/repositories/NewsRepository';
import { News } from '../../../domain/entities/News';
import { FiltredNews, NewsResumeDTO } from '../../dtos/NewsDTO';

// Mock implementation of the NewsRepository
class MockNewsRepository implements NewsRepository {
  private mockNews: News[] = [
    {
      id: '1',
      title: 'Test News 1',
      content: 'Content 1',
      resume: 'Resume 1',
      datePublished: new Date('2023-01-01'),
      source: 'Source 1',
      author: 'Author 1',
      categories: ['tech'],
      urlImages: 'https://example.com/image1.jpg',
      urlOriginal: 'https://example.com/news/1'
    },
    {
      id: '2',
      title: 'Test News 2',
      content: 'Content 2',
      resume: 'Resume 2',
      datePublished: new Date('2023-01-02'),
      source: 'Source 2',
      author: 'Author 2',
      categories: ['science'],
      urlImages: 'https://example.com/image2.jpg',
      urlOriginal: 'https://example.com/news/2'
    }
  ];

  async getAll(filtred?: FiltredNews): Promise<News[]> {
    if (!filtred) return this.mockNews;
    
    let result = [...this.mockNews];
    
    if (filtred.categories) {
      result = result.filter(news => 
        news.categories.includes(filtred.categories || '')
      );
    }
    
    if (filtred.term) {
      const term = filtred.term.toLowerCase();
      result = result.filter(news => 
        news.title.toLowerCase().includes(term) ||
        news.content.toLowerCase().includes(term) ||
        news.resume.toLowerCase().includes(term)
      );
    }
    
    return result;
  }

  async getById(id: string): Promise<News | null> {
    const news = this.mockNews.find(news => news.id === id);
    return news || null;
  }

  async save(news: News): Promise<void> {
    const existingIndex = this.mockNews.findIndex(n => n.id === news.id);
    if (existingIndex !== -1) {
      this.mockNews[existingIndex] = news;
    } else {
      this.mockNews.push(news);
    }
  }

  async updatedCache(): Promise<void> {
    // Mock implementation - does nothing in tests
    return Promise.resolve();
  }
}

describe('NewsService', () => {
  let newsService: NewsServiceImpl;
  let mockRepository: NewsRepository;

  beforeEach(() => {
    mockRepository = new MockNewsRepository();
    newsService = new NewsServiceImpl(mockRepository);
  });

  describe('listNews', () => {
    it('should return a list of NewsResumeDTO objects', async () => {
      const result = await newsService.listNews({});
      
      expect(Array.isArray(result)).toBe(true);
      expect(result.length).toBe(2);
      
      // Check that each object is a NewsResumeDTO
      result.forEach(item => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('resume');
        expect(item).toHaveProperty('datePublished');
        expect(item).toHaveProperty('source');
        expect(item).toHaveProperty('urlImages');
      });
      
      // Check that detailed content is not included
      result.forEach(item => {
        expect(item).not.toHaveProperty('content');
        expect(item).not.toHaveProperty('author');
        expect(item).not.toHaveProperty('categories');
        expect(item).not.toHaveProperty('urlOriginal');
      });
    });

    it('should filter news by category', async () => {
      const result = await newsService.listNews({ categories: 'tech' });
      
      expect(result.length).toBe(1);
      expect(result[0].title).toBe('Test News 1');
    });

    it('should return empty array when no news match the filter', async () => {
      const result = await newsService.listNews({ categories: 'sports' });
      
      expect(result).toEqual([]);
    });
  });

  describe('getNewsById', () => {
    it('should return a full News object when found', async () => {
      const result = await newsService.getNewsById('1');
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe('1');
      expect(result?.title).toBe('Test News 1');
      expect(result?.content).toBe('Content 1');
      expect(result?.categories).toEqual(['tech']);
    });

    it('should return null when news is not found', async () => {
      const result = await newsService.getNewsById('999');
      
      expect(result).toBeNull();
    });
  });

  describe('updatedCacheNews', () => {
    it('should call the repository updatedCache method', async () => {
      const spy = jest.spyOn(mockRepository, 'updatedCache');
      
      await newsService.updatedCacheNews();
      
      expect(spy).toHaveBeenCalledTimes(1);
    });
  });
});