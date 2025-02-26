import { Router } from "express";
import { NewsController } from "../controllers/NewsController";
import { NewsService } from "../../applications/services/NewsService";
import { CacheService } from "../../infrastructure/cache/CacheService";

export const createNewsRoutes = (
  newsService: NewsService,
  cacheService: CacheService,
) => {
  const router = Router();
  const newsController = new NewsController(newsService, cacheService);

  router.get('/news', newsController.listingNews);
  router.get('/news/:id', newsController.getNewsById);

  return router;
}