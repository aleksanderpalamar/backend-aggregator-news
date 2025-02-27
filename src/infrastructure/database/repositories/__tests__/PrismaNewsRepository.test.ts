import { PrismaNewsRepository } from "../PrismaNewsRepository";
import { CacheService } from "../../../cache/CacheService";
import { News } from "../../../../domain/entities/News";
import prisma from "../../prisma/prismaClient";

// Mock Prisma client
jest.mock("../../prisma/prismaClient", () => ({
  __esModule: true,
  default: {
    news: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn()
    }
  }
}));

describe("PrismaNewsRepository", () => {
  let repository: PrismaNewsRepository;
  let cacheService: CacheService;
  
  const mockNews: News[] = [
    {
      id: "1",
      title: "Test News 1",
      content: "Content 1",
      resume: "Resume 1",
      datePublished: new Date("2023-01-01"),
      source: "Source 1",
      author: "Author 1",
      categories: ["tech"],
      urlImages: "https://example.com/image1.jpg",
      urlOriginal: "https://example.com/news/1"
    },
    {
      id: "2",
      title: "Test News 2",
      content: "Content 2",
      resume: "Resume 2",
      datePublished: new Date("2023-01-02"),
      source: "Source 2",
      author: "Author 2",
      categories: ["science"],
      urlImages: "https://example.com/image2.jpg",
      urlOriginal: "https://example.com/news/2"
    }
  ];

  // Mock data from Prisma
  const mockPrismaNews = [
    {
      id: "1",
      title: "Test News 1",
      content: "Content 1",
      resume: "Resume 1",
      datePublished: new Date("2023-01-01"),
      source: "Source 1",
      author: "Author 1",
      categories: ["tech"],
      urlImages: "https://example.com/image1.jpg",
      urlOriginal: "https://example.com/news/1",
      createdAt: new Date(),
      updatedAt: new Date()
    },
    {
      id: "2",
      title: "Test News 2",
      content: "Content 2",
      resume: "Resume 2",
      datePublished: new Date("2023-01-02"),
      source: "Source 2",
      author: "Author 2",
      categories: ["science"],
      urlImages: "https://example.com/image2.jpg",
      urlOriginal: "https://example.com/news/2",
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ];

  beforeEach(() => {
    cacheService = new CacheService();
    repository = new PrismaNewsRepository(cacheService);
    
    // Reset all mocks
    jest.clearAllMocks();
    
    // Spy on cache service
    jest.spyOn(cacheService, "get");
    jest.spyOn(cacheService, "set");
  });

  describe("getAll", () => {
    it("should return cached news when available", async () => {
      // Setup cache to return mock data
      jest.spyOn(cacheService, "get").mockReturnValue(mockNews);
      
      const result = await repository.getAll({});
      
      expect(cacheService.get).toHaveBeenCalledWith("allNews");
      expect(prisma.news.findMany).not.toHaveBeenCalled();
      expect(result).toEqual(mockNews);
    });

    it("should query database when cache is empty", async () => {
      // Setup cache to return nothing
      jest.spyOn(cacheService, "get").mockReturnValue(undefined);
      
      // Setup prisma to return mock data
      (prisma.news.findMany as jest.Mock).mockResolvedValue(mockPrismaNews);
      
      const result = await repository.getAll({});
      
      expect(cacheService.get).toHaveBeenCalledWith("allNews");
      expect(prisma.news.findMany).toHaveBeenCalled();
      
      // Verify result structure from database
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
    });

    it("should apply category filters correctly", async () => {
      // Setup cache to return nothing to force database query
      jest.spyOn(cacheService, "get").mockReturnValue(undefined);
      
      // Setup prisma to return mock data
      (prisma.news.findMany as jest.Mock).mockResolvedValue([mockPrismaNews[0]]);
      
      const result = await repository.getAll({ categories: "tech" });
      
      expect(prisma.news.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          categories: { has: "tech" }
        })
      }));
      
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
    });

    it("should apply search term filters correctly", async () => {
      // Setup cache to return nothing to force database query
      jest.spyOn(cacheService, "get").mockReturnValue(undefined);
      
      // Setup prisma to return mock data
      (prisma.news.findMany as jest.Mock).mockResolvedValue([mockPrismaNews[0]]);
      
      const result = await repository.getAll({ term: "test" });
      
      expect(prisma.news.findMany).toHaveBeenCalledWith(expect.objectContaining({
        where: expect.objectContaining({
          OR: expect.arrayContaining([
            { title: { contains: "test", mode: "insensitive" } },
            { content: { contains: "test", mode: "insensitive" } },
            { resume: { contains: "test", mode: "insensitive" } }
          ])
        })
      }));
    });
  });

  describe("getById", () => {
    it("should return news by id when found", async () => {
      (prisma.news.findUnique as jest.Mock).mockResolvedValue(mockPrismaNews[0]);
      
      const result = await repository.getById("1");
      
      expect(prisma.news.findUnique).toHaveBeenCalledWith({
        where: { id: "1" }
      });
      
      expect(result).not.toBeNull();
      expect(result?.id).toBe("1");
      expect(result?.title).toBe("Test News 1");
    });

    it("should return null when news is not found", async () => {
      (prisma.news.findUnique as jest.Mock).mockResolvedValue(null);
      
      const result = await repository.getById("999");
      
      expect(prisma.news.findUnique).toHaveBeenCalledWith({
        where: { id: "999" }
      });
      
      expect(result).toBeNull();
    });
  });

  describe("save", () => {
    it("should not create news if it already exists", async () => {
      (prisma.news.findFirst as jest.Mock).mockResolvedValue(mockPrismaNews[0]);
      
      await repository.save(mockNews[0]);
      
      expect(prisma.news.findFirst).toHaveBeenCalledWith({
        where: { urlOriginal: mockNews[0].urlOriginal }
      });
      
      expect(prisma.news.create).not.toHaveBeenCalled();
    });

    it("should create news if it doesn't exist", async () => {
      (prisma.news.findFirst as jest.Mock).mockResolvedValue(null);
      
      await repository.save(mockNews[0]);
      
      expect(prisma.news.findFirst).toHaveBeenCalledWith({
        where: { urlOriginal: mockNews[0].urlOriginal }
      });
      
      expect(prisma.news.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          title: mockNews[0].title,
          content: mockNews[0].content,
          resume: mockNews[0].resume,
          urlOriginal: mockNews[0].urlOriginal
        })
      });
    });
  });

  describe("updatedCache", () => {
    it("should fetch all news and update cache", async () => {
      (prisma.news.findMany as jest.Mock).mockResolvedValue(mockPrismaNews);
      
      await repository.updatedCache();
      
      expect(prisma.news.findMany).toHaveBeenCalledWith({
        orderBy: { datePublished: "desc" }
      });
      
      expect(cacheService.set).toHaveBeenCalledWith("allNews", expect.any(Array));
    });
  });
});