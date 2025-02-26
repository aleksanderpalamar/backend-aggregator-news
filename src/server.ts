import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { createNewsRoutes } from './interface/routes/newsRoutes';
import { errorHandler } from './interface/middlewares/errorHandler';
import { NewsServiceImpl } from './applications/services/NewsService';
import { NewsRepositoryImpl } from './infrastructure/database/repositories/NewsRepositoryImpl';
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

mongoose.connect(process.env.MONGO_URI as string)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
    process.exit(1);
  });

const newsApiAdapter = new NewsApiAdapter(
  process.env.NEWS_API_KEY as string
);
const newsRepository = new NewsRepositoryImpl(newsApiAdapter);
const cacheService = new CacheService();
const newsService = new NewsServiceImpl(newsRepository);
const updatedNews = new UpdatedNews(newsService, cacheService);

updatedNews.start();

app.use('/api', createNewsRoutes(newsService, cacheService));

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});