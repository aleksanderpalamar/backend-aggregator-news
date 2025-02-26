export interface FiltredNews {
  categories?: string;
  term?: string;
  page?: number;
  quantity?: number;
}

export interface NewsResumeDTO {
  id: string;
  title: string;
  resume: string;
  datePublished: Date;
  source: string;
  urlImages: string;
}