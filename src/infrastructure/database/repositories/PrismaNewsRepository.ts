/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { News } from "../../../domain/entities/News";
import { NewsRepository } from "../../../domain/entities/repositories/NewsRepository";
import { FiltredNews } from "../../../applications/dtos/NewsDTO";
import prisma from "../prisma/prismaClient";
import { CacheService } from "../../cache/CacheService";
import { NewsApiAdapter } from "../../external/newsapi/NewsApiAdapter";

export class PrismaNewsRepository implements NewsRepository {
  private cacheService: CacheService;
  private newsApiAdapter: NewsApiAdapter;
  
  constructor(cacheService: CacheService, newsApiAdapter: NewsApiAdapter) {
    this.cacheService = cacheService;
    this.newsApiAdapter = newsApiAdapter;
  }

  async getAll(filter: FiltredNews): Promise<News[]> {
    const cachedNews = this.cacheService.get<News[]>("allNews");
    if (cachedNews) {
      return this.applyFilters(cachedNews, filter);
    }

    // If not in cache, fetch from database
    const page = filter.page || 1;
    const quantity = filter.quantity || 10;
    const skip = (page - 1) * quantity;

    // Build the query conditions
    let where: any = {};
    
    if (filter.categories) {
      where.categories = {
        has: filter.categories
      };
    }
    
    if (filter.term) {
      where.OR = [
        { title: { contains: filter.term, mode: 'insensitive' } },
        { content: { contains: filter.term, mode: 'insensitive' } },
        { resume: { contains: filter.term, mode: 'insensitive' } }
      ];
    }

    const newsFromDb = await prisma.news.findMany({
      where,
      skip,
      take: quantity,
      orderBy: {
        datePublished: 'desc'
      }
    });

    // Map Prisma model to domain entity
    const news = newsFromDb.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      resume: item.resume,
      datePublished: item.datePublished,
      source: item.source,
      author: item.author,
      categories: item.categories,
      urlImages: item.urlImages || '',
      urlOriginal: item.urlOriginal
    }));

    return news;
  }

  async getById(id: string): Promise<News | null> {
    const newsItem = await prisma.news.findUnique({
      where: { id }
    });

    if (!newsItem) return null;

    return {
      id: newsItem.id,
      title: newsItem.title,
      content: newsItem.content,
      resume: newsItem.resume,
      datePublished: newsItem.datePublished,
      source: newsItem.source,
      author: newsItem.author,
      categories: newsItem.categories,
      urlImages: newsItem.urlImages || '',
      urlOriginal: newsItem.urlOriginal
    };
  }

  async save(news: News): Promise<void> {
    try {
      await this.saveMultipleNews([news]);
    } catch (error) {
      console.error(`Erro ao salvar notícia "${news.title}":`, error);
      throw error;
    }
  }

  async updatedCache(): Promise<void> {
    try {
      // Verificar se a API KEY está configurada
      if (!process.env.NEWS_API_KEY) {
        console.warn("NEWS_API_KEY não está configurada. Não será possível buscar notícias da API externa.");
        await this.updateCacheFromDatabase();
        return;
      }
      
      console.log("Buscando notícias da API externa...");
      // Fetch news from the external API using the adapter
      const externalNews = await this.newsApiAdapter.getNews();
      
      if (externalNews.length === 0) {
        console.warn("Nenhuma notícia recebida da API externa. Usando apenas notícias do banco de dados.");
        await this.updateCacheFromDatabase();
        return;
      }
      
      console.log(`Recebido ${externalNews.length} notícias da API externa. Salvando no banco de dados...`);
      
      // Save each news item to the database
      const savedCount = await this.saveMultipleNews(externalNews);
      
      // Atualizar o cache com todas as notícias (incluindo as novas)
      await this.updateCacheFromDatabase();
      
      console.log(`Salvas ${savedCount} novas notícias da API externa no banco de dados.`);
    } catch (error) {
      console.error("Erro ao atualizar o cache de notícias:", error);
      // Em caso de erro, tente pelo menos atualizar o cache com os dados do banco
      try {
        await this.updateCacheFromDatabase();
      } catch (dbError) {
        console.error("Erro ao atualizar o cache a partir do banco de dados:", dbError);
      }
    }
  }
  
  // Método auxiliar para salvar múltiplas notícias e contar apenas as novas
  private async saveMultipleNews(newsList: News[]): Promise<number> {
    let savedCount = 0;
    
    for (const news of newsList) {
      try {
        // First check if the news already exists
        const exists = await prisma.news.findUnique({
          where: {
            urlOriginal: news.urlOriginal
          },
          select: { id: true }
        });
        
        // If it doesn't exist, create it
        if (!exists) {
          await prisma.news.create({
            data: {
              title: news.title,
              content: news.content,
              resume: news.resume,
              datePublished: news.datePublished,
              source: news.source,
              author: news.author,
              categories: news.categories,
              urlImages: news.urlImages,
              urlOriginal: news.urlOriginal
            }
          });
          savedCount++;
        }
      } catch (error) {
        console.error(`Erro ao salvar notícia "${news.title}":`, error);
        // Continuar tentando salvar as outras notícias
      }
    }
    
    return savedCount;
  }
  
  // Método auxiliar para atualizar o cache com dados do banco
  private async updateCacheFromDatabase(): Promise<void> {
    // Get all news from database
    const allNews = await prisma.news.findMany({
      orderBy: { datePublished: 'desc' }
    });
    
    // Map to domain entities
    const news = allNews.map(item => ({
      id: item.id,
      title: item.title,
      content: item.content,
      resume: item.resume,
      datePublished: item.datePublished,
      source: item.source,
      author: item.author,
      categories: item.categories,
      urlImages: item.urlImages || '',
      urlOriginal: item.urlOriginal
    }));
    
    // Store in cache
    this.cacheService.set("allNews", news);
    console.log(`Cache atualizado com ${news.length} notícias do banco de dados.`);
  }

  private applyFilters(news: News[], filter: FiltredNews): News[] {
    let filteredNews = [...news];
    
    // Filter by category
    if (filter.categories) {
      filteredNews = filteredNews.filter(item => 
        item.categories.includes(filter.categories || '')
      );
    }
    
    // Filter by search term
    if (filter.term) {
      const term = filter.term.toLowerCase();
      filteredNews = filteredNews.filter(item => 
        item.title.toLowerCase().includes(term) ||
        item.resume.toLowerCase().includes(term) ||
        item.content.toLowerCase().includes(term)
      );
    }
    
    // Apply pagination
    const page = filter.page || 1;
    const quantity = filter.quantity || 10;
    const skip = (page - 1) * quantity;
    
    return filteredNews.slice(skip, skip + quantity);
  }
}