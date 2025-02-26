import { NewsRepository } from "../../../domain/entities/repositories/NewsRepository";
import { News } from "../../../domain/entities/News";
import { FiltredNews } from "../../../applications/dtos/NewsDTO";
import { NewsModel } from "../models/NewsModel";
import { NewsApiAdapter } from "../../external/newsapi/NewsApiAdapter";

export class NewsRepositoryImpl implements NewsRepository {
  private newsApiAdapter: NewsApiAdapter;

  constructor(newsApiAdapter: NewsApiAdapter) {
    this.newsApiAdapter = newsApiAdapter;
  }

  async getAll(filtred?: FiltredNews): Promise<News[]> {
    const query = {
      ...(filtred?.categories && {
        categories: filtred.categories,
      }),
      ...(filtred?.term && {
        $text: { $search: filtred.term },
      }),
    };

    if (filtred?.categories) {
      query.categories = filtred.categories;
    }

    if (filtred?.term) {
      query.$text = { $search: filtred.term };
    }

    const news = await NewsModel.find(query)
      .sort({ datePublished: -1 })
      .skip(((filtred?.page || 1) - 1) * (filtred?.quantity || 10))
      .limit(filtred?.quantity || 10);

    return news.map((n) => n.toEntity());
  }

  async getById(id: string): Promise<News | null> {
    const news = await NewsModel.findById(id);
    return news ? news.toEntity() : null;
  }

  async save(news: News): Promise<void> {
    await NewsModel.findOneAndUpdate(
      { urlOriginal: news.urlOriginal },
      { ...news },
      { upsert: true, new: true }
    );
  }

  async updatedCache(): Promise<void> {
    try {
      const newsCategories = [
        "business",
        "entertainment",
        "health",
        "science",
        "sports",
        "technology",
      ];

      for (const category of newsCategories) {
        const news = await this.newsApiAdapter.getNews({
          categories: category,
          quantity: 20,
        });

        for (const newsItem of news) {
          await this.save(newsItem);
        }
      }
    } catch (error) {
      console.error("Error updating cache:", error);
      throw error;
    }
  }
}
