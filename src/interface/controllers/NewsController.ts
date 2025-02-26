import { Request, Response } from 'express';

import { CacheService } from '../../infrastructure/cache/CacheService';
import { NewsService } from '../../applications/services/NewsService';
import { FiltredNews } from '../../applications/dtos/NewsDTO';

export class NewsController {
  private newsService: NewsService;
  private cacheService: CacheService;
  
  constructor(newsService: NewsService, cacheService: CacheService) {
    this.newsService = newsService;
    this.cacheService = cacheService;
  }

  listingNews = async (req: Request, res: Response): Promise<void> => {
    try {
      const filtred: FiltredNews = {
        categories: req.query.categoria as string,
        term: req.query.search as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        quantity: req.query.quantity ? parseInt(req.query.quantity as string) : 10
      };
      
      const cacheKey = CacheService.generateKeyCache('news:list', filtred);
      const cachedData = this.cacheService.get(cacheKey);
      
      if (cachedData) {
        res.status(200).json(cachedData);
        return;
      }
      
      const news = await this.newsService.listNews(filtred);
      
      this.cacheService.set(cacheKey, news, 300);
      
      res.status(200).json(news);
    } catch (error) {
      console.error('Error retrieving news:', error);
      res.status(500).json({ 
        erro: 'Error retrieving news',
        mensagem: 'An error occurred while retrieving the news. Please try again.'
      });
    }
  };

  getNewsById = async (req: Request, res: Response): Promise<void> => {
    try {
      const id = req.params.id;
      
      const cacheKey = CacheService.generateKeyCache('news:details', { id });
      const cachedData = this.cacheService.get(cacheKey);
      
      if (cachedData) {
        res.status(200).json(cachedData);
        return;
      }
      
      const news = await this.newsService.getNewsById(id);
      
      if (!news) {
        res.status(404).json({ 
          erro: 'News not found',
          mensagem: 'This news does not exist.'
        });
        return;
      }
      // 10 minutes cache
      this.cacheService.set(cacheKey, news, 600);
      
      res.status(200).json(news);
    } catch (error) {
      console.error('Error retrieving news:', error);
      res.status(500).json({ 
        erro: 'Error retrieving news',
        mensagem: 'An error occurred while retrieving the news. Please try again.'
      });
    }
  };
}