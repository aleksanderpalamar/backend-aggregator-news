import { News } from "../../domain/entities/News";
import { NewsRepository } from "../../domain/entities/repositories/NewsRepository";
import { FiltredNews, NewsResumeDTO } from "../dtos/NewsDTO";

export interface NewsService {
  listNews(filtred?: FiltredNews): Promise<NewsResumeDTO[]>;
  getNewsById(id: string): Promise<News | null>;
  updatedCacheNews(): Promise<void>;
}

export class NewsServiceImpl implements NewsService {
  private repository: NewsRepository;

  constructor(repository: NewsRepository) {
    this.repository = repository;
  }

  async listNews(filtred: FiltredNews): Promise<NewsResumeDTO[]> {
    const news = await this.repository.getAll(filtred);

    return news.map(n => ({
      id: n.id,
      title: n.title,
      resume: n.resume,
      datePublished: n.datePublished,
      source: n.source,
      urlImages: n.urlImages,
    }))
  }

  async getNewsById(id: string): Promise<News | null> {
      return await this.repository.getById(id)
  }

  async updatedCacheNews(): Promise<void> {
    await this.repository.updatedCache()
  }
}