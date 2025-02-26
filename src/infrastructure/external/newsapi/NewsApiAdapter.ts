/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import { v4 as uuidv4 } from "uuid";
import { FiltredNews } from "../../../applications/dtos/NewsDTO";
import { News } from "../../../domain/entities/News";

export class NewsApiAdapter {
  private apiKey: string;
  private baseUrl: string;
  private limitRequests: number = 0;
  private lastRequestTime: number = 0;
  private requestInterval: number = 1000; // 1 second in milliseconds (adjust as needed)

  private async throttleRequest() {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;

    if (elapsed < this.requestInterval) {
      await new Promise((resolve) => setTimeout(resolve, this.requestInterval - elapsed))
    }

    this.lastRequestTime = Date.now();
    this.limitRequests++;
  }

  private mapingForNews(articles: any[]): News[] {
    return articles.map((article) => ({
      id: uuidv4(),
      title: article.title,
      content: article.content || "",
      resume: article.description || "",
      datePublished: new Date(article.publishedAt),
      source: article.source.name,
      author: article.author || "Unknown",
      categories: article.category ? [article.category] : [],
      urlImages: article.urlToImage || "",
      urlOriginal: article.url,
    }))
  }

  constructor(apiKey: string) {
    this.apiKey = apiKey;
    this.baseUrl = "https://newsapi.org/v2";
  }

  async getNews(filtred?: FiltredNews): Promise<News[]> {
    await this.throttleRequest();
    
    const endpoint = '/top-headlines';
    const params = {
      apiKey: this.apiKey,
      language: "pt",
      pageSize: filtred?.quantity || 20,
      ...filtred?.categories && {
        category: filtred.categories
      },
      ...filtred?.term && {
        q: filtred.term
      },
      page: filtred?.page || 1,
    };

    if (filtred?.categories) {
      params.category = filtred.categories;
    }

    if (filtred?.term) {
      params.q = filtred.term;
    }

    try {
      const response = await axios.get(`${this.baseUrl}${endpoint}`, { params });

      return this.mapingForNews(response.data.articles);
    } catch (error) {
      console.error("Error fetching news:", error);
      throw new Error("Error fetching news");      
    }
  }
}
