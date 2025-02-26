import { News } from "../News";
import { FiltredNews } from "../../../applications/dtos/NewsDTO";

export interface NewsRepository {
  getAll(filtred: FiltredNews): Promise<News[]>;
  getById(id: string): Promise<News | null>;
  save(news: News): Promise<void>;
  updatedCache(): Promise<void>;
}
