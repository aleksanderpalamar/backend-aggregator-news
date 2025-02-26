# Backend Aggregator News

Backend system for aggregating news from multiple sources, caching it and making it available via a REST API.

## Overview

This project implements a robust backend for news aggregation, following Clean Architecture principles. The system connects to external news APIs (such as NewsAPI), caches the data to optimize performance, and provides REST endpoints so that frontend applications can consume this data.

## Architecture
The project follows the Clean Architecture with the following layers:

1. Domain: Contains the business entities and repository interfaces
2. Application: Implements the use cases and services
3. Infrastructure: Contains concrete implementations of repositories, external integrations and cache
4. Interface: Exposes the REST endpoints and implements the controllers

## Structure directory
```
backend-agregador-news/
├── src/
│   ├── domain/                     # Domain Layer
│   │   ├── entities/               # Business entities
│   │   │   └── News.ts
│   │   └── repositories/           # Repository interfaces
│   │       └── NewsRepository.ts
│   │
│   ├── application/                # Application Layer
│   │   ├── services/               # Use cases and services
│   │   │   └── NewsService.ts
│   │   └── dtos/                   # Data transfer objects
│   │       └── NewsDTO.ts
│   │
│   ├── infrastructure/             # Infrastructure Layer
│   │   ├── database/               # Implementing persistence
│   │   │   ├── models/
│   │   │   │   └── NewsModel.ts
│   │   │   └── repositories/
│   │   │       └── NewsRepositoryImpl.ts
│   │   ├── external/               # Integrations with external APIs
│   │   │   └── newsapi/
│   │   │       └── NewsApiAdapter.ts
│   │   └── cache/                  # Implementation of the cache mechanism
│   │       └── CacheService.ts
│   │
│   ├── interface/                  # Interface Layer
│   │   ├── controllers/            # Controllers API
│   │   │   └── NewsController.ts
│   │   ├── middlewares/            # Middlewares
│   │   │   └── errorHandler.ts
│   │   └── routes/                 # Routes
│   │       └── newsRoutes.ts
│   │
│   ├── config/                     # Settings and environment variables
│   │   └── scheduler.ts            # Scheduler for periodic updates
│   └── server.ts                   # Main entry point
│
├── .env.example                    # Example environment variables
├── .gitignore                      
├── package.json                    
├── tsconfig.json                   
└── README.md                       
```                     
## Features
- Integration with News APIs: Connection with public APIs (like NewsAPI) to get real-time news
- Cache and Storage: Caching mechanism to reduce external calls and improve performance
- Automatic Update: Periodic news update system (every 10 minutes by default)
- REST API: Endpoints to list, filter and search news
- Advanced Filters: Support for filtering by category, search term and pagination.

## Endpoints
**List News**

- GET /news
- Query Parameters:
  - category: Filter news by category (e.g. sports, technology)
  - search: Search for term in news
  - page: Page number for pagination (default: 1)
  - quantity: Quantity of items per page (default: 10)

- Response: List of summarized news

**Get News Details**

- GET /news/{id}
- Path Parameters:
  - id: Unique ID of the news

- Response: Full details of the news.

## Technologies Used

- Node.js: Runtime environment
- TypeScript: Programming language
- Express: Web framework
- Mongoose: ODM for MongoDB
- Axios: HTTP client for external requests
- Node-cache: In-memory cache implementation

## Requirements

- Node.js 14+
- MongoDB 4+
- NewsAPI API key

## Installation and Setup

1. Clone the repository: `git clone https://github.com/aleksanderpalamar/backend-aggregator-news.git`
2. Install dependencies: `npm install`
3. Create a `.env` file based on `.env.example`
4. Run the application:
```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Environment Variables
```bash
# Server
PORT=3000
NODE_ENV=development

# MongoDB
MONGODB_URI=mongodb://localhost:27017/noticias

# NewsAPI
NEWS_API_KEY=sua_chave_api

# Cache
CACHE_TTL=600  # Time to live for cache in seconds
UPDATE_INTERVAL=10  # Interval for periodic update in minutes
```	

## Security

The project implements several security measures:

- Helmet: Protection against common vulnerabilities
- Rate Limiting: Limiting requests to prevent brute force attacks
- Input Validation: Strict validation of user input
- Data Sanitization: Prevention against code injection

## Features to be implemented

- Test coverage: Increase test coverage to ensure code quality
- Test integration: Implement integration tests to ensure the correct functioning of the system.
- Test unit: Implement unit tests to ensure the correct functioning of the system.

## Performance

To ensure high performance, the system implements:

- Multi-layer caching (database and memory)
- Optimized indexing in MongoDB
- HTTP response compression
- Request rate control for external APIs

## Contributing
1. Fork the repository
2. Create a new branch: `git checkout -b feature/my-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/my-feature`
5. Open a pull request

## License
This project is licensed under the [MIT License](LICENSE).