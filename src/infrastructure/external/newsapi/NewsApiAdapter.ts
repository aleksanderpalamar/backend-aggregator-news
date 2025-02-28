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
  private requestInterval: number = 30 * 60 * 1000; // 30 minutos

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
      categories: article.category ? [article.category] : ["general"], // Default to "general" if no category
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
    
    // Definir o tipo para o objeto params
    const params: {
      apiKey: string;
      language: string;
      country: string;
      pageSize: number;
      page: number;
      category?: string;
      q?: string;
    } = {
      apiKey: this.apiKey,
      language: "en",
      country: "us", // Adicionando país para garantir resultados
      pageSize: filtred?.quantity || 20,
      page: filtred?.page || 1,
    };

    if (filtred?.categories) {
      params.category = filtred.categories;
    }

    if (filtred?.term) {
      params.q = filtred.term;
    }

    try {
      console.log(`Requesting news from ${this.baseUrl}${endpoint} with params:`, { ...params, apiKey: "***" });
      const response = await axios.get(`${this.baseUrl}${endpoint}`, { params });
      
      if (!response.data || !response.data.articles) {
        console.error("Invalid API response:", response.data);
        return [];
      }
      
      console.log(`Received ${response.data.articles.length} articles from NewsAPI`);
      return this.mapingForNews(response.data.articles);
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.error("Error fetching news:", {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
          url: error.config?.url
        });
      } else {
        console.error("Error fetching news:", error);
      }
      
      // Retornar array vazio em vez de lançar erro para evitar falha completa
      return [];
    }
  }
}
