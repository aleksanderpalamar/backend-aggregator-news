/* eslint-disable prefer-const */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { News } from "../../../domain/entities/News";
import { NewsRepository } from "../../../domain/entities/repositories/NewsRepository";
import { FiltredNews } from "../../../applications/dtos/NewsDTO";
import prisma from "../prisma/prismaClient";
import { CacheService } from "../../cache/CacheService";

export class PrismaNewsRepository implements NewsRepository {
  private cacheService: CacheService;
  
  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
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
    // Check if news already exists
    const exists = await prisma.news.findFirst({
      where: {
        urlOriginal: news.urlOriginal
      }
    });

    if (!exists) {
      // Create new news item
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
    }
  }

  async updatedCache(): Promise<void> {
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