# JurisGuide — AI-Powered Legal Assistance

Understand your legal documents. Know your rights. JurisGuide uses AI to simplify complex legal information and help you understand your documents in plain language.

## Features

### MVP (Complete)
- **User Authentication** — Email/password sign-up and login with Supabase Auth
- **Dashboard** — Personalized home with quick actions, stats, and recent activity
- **AI Document Analyzer** — Upload legal documents and get clause-by-clause analysis with risk indicators, simple explanations, key legal terms, and recommendations
- **AI Legal Chatbot** — Ask legal questions with document-aware conversations, chat history, suggested questions, copy/save responses
- **My Documents** — Secure document management with folders, search, rename, download, and delete
- **Legal Topics Library** — Searchable guides covering Property, Marriage & Family, Traffic Laws, Human Rights, Fundamental Duties, and Court Proceedings
- **Court Reminders** — Calendar and upcoming view for tracking hearings with case details
- **Multilingual Support** — UI and AI explanations in English, Hindi, Bengali, Tamil, Telugu, and Marathi
- **Profile Management** — Update personal info, preferred language, notification settings, and security
- **Dark/Light Mode** — Full theme toggle with system preference detection
- **Legal Disclaimer** — Prominent disclaimers throughout the app clarifying this is not professional legal advice

### Advanced (Complete)
- **Admin Dashboard** — Platform statistics including user counts, document analysis, chat queries, language usage, document type distribution, and recent users (admin-only access)
- **Responsive Design** — Optimized for mobile, tablet, and desktop

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Framer Motion |
| Icons | Lucide React |
| Routing | React Router DOM |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| AI Engine | Custom analysis engine deployed as Supabase Edge Functions (Deno) |
| Database | PostgreSQL via Supabase with Row Level Security |

## Architecture

```
Frontend (React/TypeScript)
    ↓
Authentication (Supabase Auth)
    ↓
Backend API (Supabase Edge Functions — Deno runtime)
    ↓
Database (PostgreSQL with RLS policies)
    ↓
Document Storage (Supabase Storage — private bucket)
    ↓
AI Processing (Edge Function analysis engine)
    ↓
Response
```

All API keys and sensitive credentials are kept server-side in Supabase Edge Functions. The frontend never has access to service-role keys.

## Database Schema

| Table | Purpose |
|-------|---------|
| `profiles` | Extends `auth.users` with full name, mobile, location, preferred language, admin flag |
| `documents` | Uploaded legal documents with extracted text, AI analysis (JSONB), risk level, folder |
| `chats` | Chat conversation sessions, optionally linked to a document |
| `messages` | Individual messages within chats (user/assistant roles, save flag) |
| `reminders` | Court hearing reminders with case details |

All tables have Row Level Security enabled with owner-scoped CRUD policies.

## Project Structure

```
src/
├── components/     # Reusable UI components (Logo, Sidebar, Topbar, Disclaimer)
├── contexts/       # React contexts (Auth, Theme, Language)
├── layouts/        # Page layouts (DashboardLayout)
├── lib/            # Utilities and types (supabase client, TypeScript types)
├── pages/          # Route pages (Landing, Login, Signup, Dashboard, Analyze, Chat, Documents, Topics, Reminders, Profile, Admin)
└── App.tsx         # Root component with routing

supabase/
├── functions/
│   ├── ai-analyze/ # Document analysis edge function
│   └── ai-chat/    # Legal chatbot edge function
└── migrations/     # Database migrations
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy `.env.example` to `.env` and fill in your Supabase credentials:
   ```
   VITE_SUPABASE_URL=your-supabase-url
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
4. Start the development server:
   ```bash
   npm run dev
   ```

### Building for Production

```bash
npm run build
```

## Team Development Guide

The project is structured for a 5-member team:

| Member | Area | Files |
|--------|------|-------|
| Frontend | Landing page, Dashboard, UI | `src/pages/LandingPage.tsx`, `src/pages/DashboardPage.tsx`, `src/components/` |
| AI | Chatbot, Document analysis | `supabase/functions/ai-chat/`, `supabase/functions/ai-analyze/` |
| Backend | APIs, Auth, Database | `src/contexts/AuthContext.tsx`, `src/lib/`, `supabase/migrations/` |
| Document Processing | OCR, Storage | `supabase/functions/ai-analyze/`, storage bucket config |
| Testing & Research | Testing, Legal sources, UX | `src/pages/LegalTopicsPage.tsx`, documentation |

## AI Integration

The AI layer is abstracted through Supabase Edge Functions, making it easy to swap providers:

- **Document Analysis** (`ai-analyze`): Extracts text, splits into clauses, assesses risk levels, generates summaries, identifies key legal terms, and provides recommendations.
- **Legal Chatbot** (`ai-chat`): Answers legal questions with topic matching, document-aware context, and clear disclaimers distinguishing general information from professional advice.

To integrate a real AI provider (e.g., OpenAI, Anthropic), modify the analysis logic in the edge functions while keeping the same API contract.

## Disclaimer

JurisGuide is an AI-powered legal information and document-understanding tool. It is not a substitute for a qualified lawyer or professional legal advice. Users should consult a qualified legal professional for advice specific to their situation.

## License

This project is for educational purposes as part of a student team development project.
