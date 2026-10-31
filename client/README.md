# VisuLingo Client

Frontend SPA for VisuLingo — English learning platform with AI object detection.

## Quick Start

```bash
# Install dependencies
cd client
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Project Structure

```
client/
├── public/           # Static assets
├── src/
│   ├── assets/       # Images/icons
│   ├── components/   # UI components
│   │   ├── common/    # Generic UI (Button, Modal, Loading, Toast, ErrorBoundary)
│   │   ├── detection/ # Detection-specific (UploadImage, BoundingBoxOverlay, ObjectList)
│   │   └── vocabulary/ # Vocabulary display (VocabCard, SavedWordsList)
│   ├── hooks/        # Custom hooks (useDetection, useVocabulary, useLocalStorage)
│   ├── pages/        # Page components (HomePage, SavedWordsPage, LoginPage, AdminPage)
│   ├── services/     # API services (api, detectionService, vocabService)
│   ├── types/        # TypeScript definitions (detection, vocabulary, auth)
│   └── utils/         # Utility functions (storage, bbox)
│   ├── App.tsx       # Root component
│   └── main.tsx      # React entry point
├── package.json
├── tsconfig.json
└── tsconfig.node.json
```

## Key Technologies

- **React 18** with **TypeScript** and **JSX**
- **Vite** for fast development with HMR
- **Tailwind CSS** for styling
- **React Query** for server state management
- **React Router** for navigation
- **Axios** for HTTP client with JWT auth interceptors

## Features

- **Home Page**: Upload images, AI detects objects, shows bounding boxes with confidence scores
- **Vocabulary Lookup**: Click any detected object to fetch word meaning from dictionary
- **Saved Words**: Guest storage via LocalStorage for offline word collection
- **Login System**: Phase 1 placeholder (authenticating will be implemented)
- **Admin Panel**: Phase 1 placeholder (admin features will be implemented)

## Navigation

- `/` — Home (image analysis)
- `/saved` — Saved vocabulary list
- `/login` — Login page
- `/admin` — Admin dashboard (future)

## Notes

- Frontend runs on **port 3000**, backend on **port 5000**
- During development, `vite.config.ts` proxies `/api/*` requests to the backend at `http://localhost:5000`
- **Authentication**: JWT token stored in `localStorage` under key `visulingo_token`
- **Guest Storage**: Saved words stored in LocalStorage under key `visulingo_saved_words`

## Future Enhancements

- User authentication with cloud storage
- Real-time collaboration
- Advanced AI features (text descriptions, scene classification)
- Mobile app development
- Analytics dashboard
- Dictionary API integration (freeDictionaryAPI)
- Cloud image storage (AWS S3/GCS)