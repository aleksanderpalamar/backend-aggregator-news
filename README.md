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

## To test the routes using Postman or similar tools, follow these steps:

1. Start the server by running `npm run dev` in the terminal.
2. Open Postman and create new requests for the following routes:

- List all news:
  - Method: GET
    - URL: http://localhost:3000/api/news
- Search for news by ID:
  - Method: GET
    - URL: http://localhost:3000/api/news/[id]
    - Replace [id] with the actual news ID

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
4. Configure your NewsAPI key in the `.env` file (get one at https://newsapi.org/)
5. Setup the database with Prisma:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```
6. Run the application:
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

# NewsAPI (REQUIRED)
# Register at https://newsapi.org/ to get your API key
NEWS_API_KEY=your_api_key_here

# The database configuration is managed by Prisma
# See prisma/schema.prisma for more details
```

## Important Notes

- **NewsAPI Key**: The application requires a valid NewsAPI key to fetch news from external sources. Without this key, the system will still work but will only serve news already stored in the database.
- **Database**: This project uses Prisma with PostgreSQL by default. You can modify the database provider in the prisma/schema.prisma file if needed.

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