# VisuLingo Server

Backend API for VisuLingo — English learning platform with AI object detection.

## Quick Start

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env
# Edit .env with your database URL and secrets

# Start PostgreSQL (requires Docker)
docker compose up -d postgres

# Run migrations
npm run migrate

# Start development server
npm run dev
```

## API Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/detection/analyze` | Upload image, detect objects | Optional |
| GET | `/api/vocabulary/lookup?word=...` | Look up vocabulary | No |
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login | No |
| GET | `/api/auth/profile` | Get current user profile | Yes |
| GET | `/api/collections` | List collections | Yes |
| POST | `/api/collections` | Create collection | Yes |
| GET | `/api/admin/stats` | System statistics | Admin |
| GET | `/api/admin/users` | List users | Admin |

## Project Structure

```
server/
├── src/
│   ├── config/         # Configuration (env, database, constants)
│   ├── controllers/    # Request handlers
│   ├── middlewares/    # Express middlewares (auth, upload, rate limit, errors)
│   ├── models/         # Database migrations
│   ├── routes/         # API route definitions
│   ├── services/       # Business logic
│   ├── adapters/       # External API adapters (Vision, Dictionary)
│   ├── utils/          # Utility functions
│   ├── app.ts          # Express app setup
│   └── server.ts       # Entry point
├── .env.example        # Environment variable template
├── package.json
└── tsconfig.json
```

## Database Schema

12 tables created by migration:
- `users` — User accounts with JWT authentication
- `images` — Uploaded images metadata
- `detected_objects` — AI detection results with bounding boxes
- `vocabularies` — Cached dictionary entries
- `saved_words` — User saved vocabulary
- `collections` — User collections of words/images
- `collection_images` — Many-to-many collections ↔ images
- `analysis_sessions` — Track image analysis sessions
- `label_mappings` — Normalize AI labels
- `app_settings` — Application configuration
- `usage_events` — Analytics events
- `audit_logs` — Security/audit trail

## Key Features

- **JWT Authentication** with bcrypt password hashing
- **RBAC** middleware (user/admin roles)
- **File upload** with Multer (type/size validation)
- **Rate limiting** on API and auth endpoints
- **Mock adapters** for Vision and Dictionary APIs
- **PostgreSQL** with UUID primary keys and constraints
- **Winston logging** with dev/prod formats

## Mock Adapters

For local development without external API keys:
- `VisionAdapter` returns deterministic mock detections (laptop, coffee cup, book, phone)
- `DictionaryAdapter` has ~10 common words with Vietnamese meanings, IPA, examples

To integrate real APIs, replace the mock implementations in:
- `src/adapters/VisionAdapter.ts`
- `src/adapters/DictionaryAdapter.ts`