# Shadowing App - English Learning Platform 🎧

A full-stack English shadowing practice application built with UX psychology principles, featuring AI feedback, gamification, and intelligent mock services.

## 🌟 Features

### Core Functionality
- **Material Creation**: Create custom shadowing materials with text-to-speech generation
- **Practice Mode**: Listen to audio with synchronized subtitles
- **Recording Mode**: Record your shadowing attempts with real-time audio capture
- **AI Feedback**: Get personalized pronunciation feedback (Gemini AI or mock mode)
- **Scoring System**: Word-level accuracy scoring with detailed comparisons

### Gamification (UX Psychology)
- **Streak System**: Daily practice streaks with fire emoji visualization
- **Daily Goals**: Progress tracking with Goal Gradient Effect
- **XP & Levels**: Experience points and level progression
- **Achievements**: Unlock badges for milestones
- **Continue Banner**: Zeigarnik Effect to encourage return

### Technical Highlights
- **Mock Services**: Full app functionality without external API keys
- **Responsive Design**: Mobile-first, works on all devices
- **Smooth Animations**: Framer Motion for delightful UX
- **Dark Theme**: Eye-friendly dark mode by default
- **TypeScript**: Full type safety across frontend and backend

## 🏗️ Architecture

### Backend (FastAPI + Python)
```
backend/
├── app/
│   ├── services/          # Service layer with mock fallbacks
│   │   ├── tts_service.py         # ElevenLabs TTS or mock
│   │   ├── stt_service.py         # ElevenLabs STT or mock
│   │   ├── ai_service.py          # Gemini AI or template-based
│   │   ├── scoring_service.py     # Pure Python word matching
│   │   ├── gamification_service.py # Streak/XP/achievements
│   │   └── timestamp_service.py   # Audio timestamp generation
│   ├── routers/           # API endpoints
│   │   ├── materials.py   # CRUD for materials
│   │   └── practice.py    # Transcribe, feedback, logs
│   ├── models/            # Pydantic models
│   ├── config.py          # Settings with env var loading
│   └── database.py        # Supabase client
└── main.py                # FastAPI app entry point
```

### Frontend (Next.js 15 + TypeScript)
```
frontend/
├── app/                   # Next.js App Router pages
│   ├── page.tsx          # Home with gamification
│   ├── materials/
│   │   ├── [id]/page.tsx        # Practice/Recording modes
│   │   ├── [id]/result/page.tsx # Score & feedback
│   │   └── create/page.tsx      # Material creation
│   ├── history/page.tsx  # Practice history
│   └── login/page.tsx    # Google OAuth
├── components/
│   ├── home/             # Gamification UI
│   ├── practice/         # Audio player, recording
│   ├── result/           # Score display, comparison
│   └── layout/           # Navbar, container
├── store/                # Zustand state management
├── lib/                  # API client, utilities
└── types/                # TypeScript definitions
```

### Database (Supabase PostgreSQL)
- `materials`: Practice content with audio URLs
- `sentences`: Time-stamped text for subtitles
- `user_stats`: Gamification data (streak, XP, level)
- `practice_logs`: History of practice sessions
- `daily_goals`: Daily practice targets
- `achievements`: Unlocked badges

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+ and uv (or pip)
- Supabase account (free tier works)
- Optional: ElevenLabs API key, Google Gemini API key

### 1. Database Setup

1. Create a Supabase project at https://supabase.com
2. Run the migration:
```bash
# Copy the SQL from supabase/migrations/001_initial_schema.sql
# and run it in Supabase SQL Editor
```

3. Create storage bucket for audio files:
   - Go to Storage in Supabase dashboard
   - Create a new bucket named `audio-files`
   - Make it public

### 2. Backend Setup

```bash
cd backend

# Create .env file
cp .env.example .env

# Edit .env with your credentials
# Required: SUPABASE_URL, SUPABASE_KEY, SUPABASE_SERVICE_KEY
# Optional: ELEVENLABS_API_KEY, GOOGLE_API_KEY

# Install dependencies
uv sync  # or: pip install -r requirements.txt

# Run the server
uv run uvicorn main:app --reload
# Or if using pip: uvicorn main:app --reload

# Server runs on http://localhost:8000
# API docs at http://localhost:8000/docs
```

### 3. Frontend Setup

```bash
cd frontend

# Create .env.local file
cp env.local.example .env.local

# Edit .env.local with your credentials
# NEXT_PUBLIC_SUPABASE_URL
# NEXT_PUBLIC_SUPABASE_ANON_KEY
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Install dependencies
npm install

# Run the dev server
npm run dev

# App runs on http://localhost:3000
```

### 4. Access the App

1. Open http://localhost:3000
2. Click "Skip (Demo Mode)" or configure Google OAuth
3. Create your first material at `/materials/create`
4. Start practicing!

## 🎯 Usage Flow

### Creating a Material
1. Navigate to "Create Material"
2. Enter title, description, and difficulty
3. Add sentences (the app will generate audio)
4. Click "Create Material"
5. Audio is generated using TTS (or mock audio if no API key)

### Practicing
1. Select a material from the home page
2. **Practice Mode**: Listen and read synchronized subtitles
3. **Recording Mode**: Click "Start Recording"
4. The audio plays while your mic records
5. Click "Stop Recording" when done
6. Get instant feedback with score and AI suggestions

### Viewing Results
- Score display with count-up animation
- Text comparison (expected vs. your answer)
- Word-by-word analysis (correct/missed/extra)
- AI feedback with personalized tips
- XP gained and streak updates

## 🔧 Configuration

### Environment Variables

#### Backend (.env)
```bash
# Required
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_KEY=eyJhbG...   # anon key
SUPABASE_SERVICE_KEY=eyJhbG...  # service role key

# Optional (leave empty for mock mode)
ELEVENLABS_API_KEY=sk_...
GOOGLE_API_KEY=AIza...

# App Config
ENVIRONMENT=development
CORS_ORIGINS=http://localhost:3000
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### Mock vs. Real APIs

The app intelligently switches between mock and real services based on API key presence:

| Service | With API Key | Without API Key |
|---------|-------------|-----------------|
| TTS | ElevenLabs API | WAV silence generator |
| STT | ElevenLabs API | Random phrase picker |
| AI Feedback | Google Gemini | Template-based feedback |
| Scoring | Word matching (always local) | Same |
| Gamification | Database-driven (always) | Same |

## 📱 Key Pages

- `/` - Home with streaks, goals, materials
- `/materials/create` - Create new material
- `/materials/[id]` - Practice/Recording modes
- `/materials/[id]/result` - Score and feedback
- `/history` - Practice history and stats
- `/login` - Google OAuth (or demo mode)

## 🎨 UX Psychology Principles

1. **Streak System** - Fear of breaking the chain
2. **Goal Gradient Effect** - "あと X 回で達成!"
3. **Zeigarnik Effect** - "Continue where you left off"
4. **Peak-End Law** - Confetti for high scores
5. **Illusion of Labor** - Processing animations
6. **Progress visualization** - XP bars, level system
7. **Immediate feedback** - Real-time score display
8. **Achievement system** - Badge unlocking
9. **Doherty Threshold** - <0.4s animations
10. **Aesthetic-Usability Effect** - Smooth motion

## 🛠️ Development

### Adding a New Feature

1. **Backend**: Add route in `app/routers/`
2. **Frontend**: Create component in `components/`
3. **Types**: Update TypeScript types in `types/`
4. **State**: Add to Zustand store if needed

### Testing Endpoints

```bash
# Health check
curl http://localhost:8000/health

# Create material
curl -X POST http://localhost:8000/api/materials \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test",
    "difficulty": "beginner",
    "sentences": ["Hello world"]
  }'

# List materials
curl http://localhost:8000/api/materials
```

## 📦 Deployment

### Backend (Railway, Render, or similar)
1. Set environment variables
2. Deploy with `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Frontend (Vercel recommended)
1. Connect GitHub repo
2. Set `NEXT_PUBLIC_*` environment variables
3. Deploy automatically

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📄 License

MIT License - feel free to use for learning purposes

## 🙏 Acknowledgments

- Built with Claude Code
- Inspired by UX psychology research
- shadcn/ui for beautiful components
- Framer Motion for smooth animations

---

**Note**: This app works fully offline with mock services. No external API keys required for basic functionality!
