import { News } from '../News';

describe('News Entity', () => {
  it('should create a valid News entity', () => {
    const newsData: News = {
      id: '1',
      title: 'Test News',
      content: 'This is the content of the test news',
      resume: 'Test news resume',
      datePublished: new Date(),
      source: 'Test Source',
      author: 'Test Author',
      categories: ['tech', 'science'],
      urlImages: 'https://example.com/image.jpg',
      urlOriginal: 'https://example.com/news/1'
    };

    expect(newsData).toHaveProperty('id');
    expect(newsData).toHaveProperty('title');
    expect(newsData).toHaveProperty('content');
    expect(newsData).toHaveProperty('resume');
    expect(newsData).toHaveProperty('datePublished');
    expect(newsData).toHaveProperty('source');
    expect(newsData).toHaveProperty('author');
    expect(newsData).toHaveProperty('categories');
    expect(newsData).toHaveProperty('urlImages');
    expect(newsData).toHaveProperty('urlOriginal');
    
    expect(Array.isArray(newsData.categories)).toBe(true);
    expect(newsData.datePublished).toBeInstanceOf(Date);
  });
});