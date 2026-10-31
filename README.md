# VisuLingo - English Learning Platform with AI Object Detection

An English learning platform that uses AI to detect objects in images and provides vocabulary learning with Vietnamese meanings.

## Architecture

- **3-layer architecture**: Client SPA → Backend REST API → PostgreSQL
- **Frontend**: React + TypeScript, Tailwind CSS, React Query/Redux Toolkit
- **Backend**: Node.js (Express.js) with TypeScript
- **Database**: PostgreSQL with pgcrypto extension for UUID generation
- **Security**: JWT authentication, bcrypt password hashing, RBAC middleware

## Project Structure

```
VisuLingo/
├── client/                    # Frontend application
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   │   ├── common/     # UI components
│   │   │   ├── detection/  # Image upload, bounding box overlay
│   │   │   └── vocabulary/ # Vocabulary cards
│   │   ├── hooks/          # Custom React hooks
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   ├── types/          # TypeScript definitions
│   │   └── utils/           # Utility functions
│   ├── package.json
│   └── tsconfig.json
├── server/                    # Backend API
│   ├── src/
│   │   ├── config/           # Configuration
│   │   ├── controllers/      # API controllers
│   │   ├── middlewares/      # Authentication, validation
│   │   ├── models/ / db/     # Database models
│   │   ├── routes/           # API routes
│   │   ├── services/         # Business logic
│   │   ├── adapters/         # External API adapters
│   │   └── utils/            # Utilities
│   ├── package.json
│   └── tsconfig.json
├── docs/                     # Documentation
└── docker-compose.yml        # Development environment
```

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite for development
- Tailwind CSS
- React Query / Redux Toolkit
- Axios for HTTP requests
- LocalStorage for guest storage

### Backend
- Node.js 20+ with TypeScript
- Express.js
- PostgreSQL client
- JWT for authentication
- bcrypt for password hashing
- Multer for file uploads
- CORS, helmet for security

### Database
- PostgreSQL
- pgcrypto extension for UUID generation
- 12 tables as specified in requirements
- Indexes and constraints for data integrity

### Adapters
- VisionAdapter: AI object detection service
- DictionaryAdapter: External dictionary API (freeDictionaryAPI)
- Mock implementations for development

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+
- Docker (optional)

### Development Setup

1. **Clone repository**
2. **Install dependencies**
   ```bash
   npm install  # in both client/ and server/ directories
   ```

3. **Set up environment variables**
   ```bash
   cp server/.env.example server/.env
   # Edit server/.env with your database credentials
   ```

4. **Run database migrations**
   ```bash
   npx prisma migrate dev  # if using Prisma
   # or run SQL migration scripts
   ```

5. **Start both services**
   ```bash
   # In terminal 1
   npm run dev  # in server/ directory
   
   # In terminal 2
   npm run dev  # in client/ directory
   ```

### Database Migrations

Create SQL migration files in `server/src/migrations/`:

```sql
-- 20241031100000_create_tables.sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(20) CHECK (role IN ('user', 'admin')) DEFAULT 'user',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Additional tables follow...
```

## API Documentation

The backend provides REST APIs for:
- User authentication and authorization
- Image upload and object detection
- Vocabulary management
- Collections and saved words

## Frontend Features

- **Home Page**: Upload images, AI detects objects, shows bounding boxes
- **Vocabulary Page**: View word meanings, IPA, examples
- **Saved Words Page**: Guest and user saved vocabulary
- **Admin Page**: User management and analytics

## Security

- JWT-based authentication
- Role-based access control (user/admin)
- Password hashing with bcrypt
- Input validation and sanitization
- CORS and security headers
- Rate limiting
- File type and size validation

## Development Notes

- Use mock adapters for local development
- API keys should be stored in environment variables
- Database backups recommended before production deployment
- Frontend and backend should run on different ports (usually 5000 and 3000)

## Future Enhancements

- Cloud storage for user uploads
- Real-time collaboration
- Advanced AI features
- Mobile app development
- Analytics dashboard

## License

This project is part of educational content development.