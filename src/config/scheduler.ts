import { NewsService } from "../applications/services/NewsService";
import { CacheService } from "../infrastructure/cache/CacheService";

export class UpdatedNews {
  private newsService: NewsService;
  private cacheService: CacheService;
  private intervalMinutes: number;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    newsService: NewsService,
    cacheService: CacheService,
    intervalMinutes: number = 10
  ) {
    this.newsService = newsService;
    this.cacheService = cacheService;
    this.intervalMinutes = intervalMinutes;
  }

  start(): void {
    this.updateNews();

    this.timer = setInterval(() => {
      this.updateNews();
    }, this.intervalMinutes * 60 * 1000);
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  private async updateNews(): Promise<void> {
    try {
      console.log(`Initialize update cache news ${new Date().toISOString()}`);

      await this.newsService.updatedCacheNews();

      this.cacheService.flush();

      console.log(`Finish update cache news ${new Date().toISOString()}`);
    } catch (error) {
      console.error("Error updating news:", error);
    }
  }
}
