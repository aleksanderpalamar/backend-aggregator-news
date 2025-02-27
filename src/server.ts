import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createNewsRoutes } from './interface/routes/newsRoutes';
import { errorHandler } from './interface/middlewares/errorHandler';
import { NewsServiceImpl } from './applications/services/NewsService';
import { PrismaNewsRepository } from './infrastructure/database/repositories/PrismaNewsRepository';
import { NewsApiAdapter } from './infrastructure/external/newsapi/NewsApiAdapter';
import { CacheService } from './infrastructure/cache/CacheService';
import { UpdatedNews } from './config/scheduler';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(helmet());
app.use(compression());
app.use(express.json());

// Verificar se a chave da API está configurada
if (!process.env.NEWS_API_KEY) {
  console.warn("ATENÇÃO: NEWS_API_KEY não está configurada no arquivo .env. A aplicação não conseguirá buscar notícias externas.");
}

const newsApiAdapter = new NewsApiAdapter(
  process.env.NEWS_API_KEY || ""
);
const cacheService = new CacheService();
const newsRepository = new PrismaNewsRepository(cacheService, newsApiAdapter);
const newsService = new NewsServiceImpl(newsRepository);
const updatedNews = new UpdatedNews(newsService, cacheService);

updatedNews.start();

app.use('/api', createNewsRoutes(newsService, cacheService));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});