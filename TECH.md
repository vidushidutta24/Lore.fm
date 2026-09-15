⚙️ Personal Spotify Music Analyzer --- Technical Specification

1. Project Overview

A full-stack web application that authenticates users with Spotify,
retrieves authorized listening data through the Spotify Web API, stores
historical snapshots, analyzes listening behavior, visualizes changes
over time, and provides personalized discovery and entertainment
features.

Primary technical goals

Secure Spotify authentication

Reliable Spotify API integration

Persistent historical data

Deterministic music analytics

Responsive data visualization

Extensible recommendation system

Clean separation of concerns

Production-ready architecture

2. Recommended Stack

Frontend

React

Vite

TypeScript

Tailwind CSS

Recharts or another React-compatible charting library

Framer Motion for animations

React Router for navigation

Backend

Node.js

Express

TypeScript

The backend should handle: - Spotify OAuth flow - Spotify API requests
that require server-side protection - Data normalization - Analytics
processing - Database operations

Database

Recommended:

PostgreSQL

Possible development alternative:

SQLite

The schema should be designed so it can migrate cleanly to PostgreSQL.

ORM

Recommended:

Prisma

Authentication

Spotify OAuth 2.0 / PKCE where appropriate

Secure session/token handling

Environment variables for credentials

Deployment

Possible deployment architecture:

Frontend: Vercel / Netlify

Backend: Render / Railway / Fly.io

Database: Neon / Supabase / Railway PostgreSQL

Choose one deployment strategy and document it clearly rather than
introducing unnecessary infrastructure.

3. High-Level Architecture

┌──────────────────────────────┐
│          React UI            │
│ Dashboard / Taste / Discover │
└──────────────┬───────────────┘
               │
               ▼
┌──────────────────────────────┐
│       Node / Express API     │
│ Auth / Spotify / Analytics   │
└───────┬───────────────┬──────┘
        │               │
        ▼               ▼
┌──────────────┐  ┌────────────────┐
│ Spotify API  │  │   PostgreSQL   │
│              │  │ Historical Data│
└──────────────┘  └────────────────┘

4. Spotify Integration

Use Spotify's official Web API.

Potential data sources include:

User profile

Top artists

Top tracks

Recently played tracks

Artist metadata

Album metadata

Track metadata

Available recommendation/discovery-related endpoints where supported

Do not hard-code assumptions about endpoints that may have changed.

Before implementing an endpoint, verify that it is currently available
and that the required scope is supported.

5. Authentication Flow

Basic flow:

User
 │
 ▼
"Connect Spotify"
 │
 ▼
Spotify Authorization
 │
 ▼
User grants permissions
 │
 ▼
Application receives authorization result
 │
 ▼
Backend obtains authorized access
 │
 ▼
Spotify API
 │
 ▼
Normalize and store data
 │
 ▼
Dashboard

Security requirements

Never expose client secrets in frontend JavaScript.

Store credentials in environment variables.

Never store Spotify passwords.

Minimize requested scopes.

Handle expired access tokens correctly.

Do not log access/refresh tokens.

Use HTTPS in production.

6. Suggested Environment Variables

SPOTIFY_CLIENT_ID=
SPOTIFY_CLIENT_SECRET=
SPOTIFY_REDIRECT_URI=

DATABASE_URL=

SESSION_SECRET=

Never commit .env files.

Include a .env.example file with empty placeholders.

7. Database Design

The database should preserve historical information instead of only
storing the latest Spotify response.

Users

User
- id
- spotifyId
- displayName
- email (only if legitimately available and required)
- createdAt
- updatedAt

Artists

Artist
- id
- spotifyId
- name
- popularity
- imageUrl
- createdAt
- updatedAt

Tracks

Track
- id
- spotifyId
- name
- artistId
- albumId
- duration
- popularity
- createdAt
- updatedAt

Albums

Album
- id
- spotifyId
- name
- imageUrl
- releaseDate
- createdAt
- updatedAt

Listening Events

ListeningEvent
- id
- userId
- trackId
- playedAt
- source
- createdAt

Artist Snapshots

ArtistSnapshot
- id
- userId
- artistId
- timeRange
- rank
- capturedAt

Track Snapshots

TrackSnapshot
- id
- userId
- trackId
- timeRange
- rank
- capturedAt

Genre Snapshots

GenreSnapshot
- id
- userId
- genre
- score
- capturedAt

The exact schema can be adjusted after verifying which Spotify fields
are currently available.

8. Historical Data Strategy

Historical analysis is a core feature.

Do not overwrite previous snapshots.

Example:

2026-01
  ↓
Top Artists Snapshot

2026-02
  ↓
Top Artists Snapshot

2026-03
  ↓
Top Artists Snapshot

This enables:

2025 → 2026

comparisons.

Because Spotify does not necessarily provide unlimited historical
listening data through a single endpoint, the application should
explicitly distinguish between:

Data retrieved directly from Spotify

Data captured and stored by this application

Calculated historical metrics

The app cannot reconstruct listening history that was never available to
it.

9. Analytics Engine

Create a separate analytics layer.

Example:

Raw Spotify Data
       ↓
Data Normalization
       ↓
Analytics Engine
       ↓
Music Profile
       ↓
Visualization / Recommendations

Possible metrics:

Artist diversity

Measure how concentrated the user's listening is among favorite artists.

Genre diversity

Measure how widely listening is distributed across genres.

Discovery rate

Measure how frequently new artists/tracks appear in the user's listening
data.

Artist loyalty

Measure repeated listening to established favorites.

Taste evolution

Compare metrics and rankings across snapshots.

10. Music DNA

Create a derived user profile.

Example structure:

interface MusicDNA {
  dominantGenres: string[];
  genreDiversity: number;
  artistDiversity: number;
  discoveryScore: number;
  loyaltyScore: number;
  mainstreamScore?: number;
  archetype: string;
}

The values should be generated from transparent calculations.

Avoid presenting arbitrary AI-generated percentages as scientific
measurements.

If an AI layer is eventually added, it should interpret
already-calculated metrics rather than inventing factual listening
statistics.

11. Recommendation Engine

Start with a rule-based recommendation system.

Possible signals:

favorite artists
favorite genres
frequently played tracks
artist similarity
genre similarity
recent listening
historical favorites
discovery behavior

Recommendation categories:

Similar

Music close to existing favorites.

Discover

Artists not currently dominant in the user's history.

Explore

Genres adjacent to genres the user already enjoys.

Wildcard

Music intentionally outside the user's normal listening patterns.

Every recommendation should have an explanation.

Example:

Recommended because:
- You frequently listen to alternative pop
- You favor emotionally driven songwriting
- You already listen to several artists with a similar style

12. Assistant Layer

The assistant should be built on structured application data.

Example internal context:

{
  "topArtists": [],
  "topGenres": [],
  "recentTracks": [],
  "tasteChanges": [],
  "discoveryScore": 0,
  "loyaltyScore": 0
}

The assistant can then generate natural-language observations.

Important:

Do not allow the assistant to fabricate statistics.

Calculated values should come from the analytics engine.

AI-generated interpretations should be clearly distinguished from
factual data.

13. Music Story Feature

The story generator should receive structured music trends such as:

recent genre changes
frequently repeated artists
new discoveries
listening intensity
historical taste changes

It can transform these into an entertaining fictional narrative.

Example:

Music Data
   ↓
Detected Patterns
   ↓
Story Prompt
   ↓
Creative Interpretation

The UI should clearly label this as entertainment.

14. API Structure

Possible backend routes:

/auth/spotify
/auth/spotify/callback
/auth/logout

/api/me
/api/me/top-artists
/api/me/top-tracks
/api/me/recently-played

/api/analytics/overview
/api/analytics/taste
/api/analytics/timeline
/api/analytics/comparison

/api/recommendations
/api/recommendations/artists
/api/recommendations/genres

/api/story

The exact route structure can be adjusted during implementation.

15. Frontend Component Structure

Possible structure:

src/
├── components/
│   ├── ArtistCard
│   ├── TrackCard
│   ├── GenreCard
│   ├── StatCard
│   ├── Chart
│   ├── Timeline
│   └── RecommendationCard
│
├── pages/
│   ├── Dashboard
│   ├── Listening
│   ├── Taste
│   ├── Timeline
│   ├── Discover
│   ├── Story
│   └── Assistant
│
├── services/
│   └── api.ts
│
├── hooks/
│
├── utils/
│
├── types/
│
└── App.tsx

16. UI Requirements

The UI should prioritize:

Clear information hierarchy

Responsive layouts

Accessible contrast

Loading states

Empty states

Error states

Skeleton loaders

Smooth transitions

Consistent cards and spacing

Avoid excessive animation that makes the analytics difficult to read.

17. Error Handling

Handle:

Spotify authentication failure

Expired authorization

API rate limits

Missing data

Empty listening history

Network failures

Database failures

Unsupported Spotify features

Never show fake data as a fallback.

Instead, display a useful explanation.

18. Development Order

Build in this order:

Phase 1 --- Foundation

Project setup

TypeScript

Tailwind

Routing

Basic layout

Phase 2 --- Spotify

Spotify developer configuration

Authentication

Profile retrieval

Top artists

Top tracks

Recently played

Phase 3 --- Dashboard

Cards

Artist grids

Track lists

Genre overview

Charts

Phase 4 --- Persistence

PostgreSQL

Prisma

User records

Listening events

Historical snapshots

Phase 5 --- Analytics

Music DNA

Diversity metrics

Discovery metrics

Taste evolution

Year comparisons

Phase 6 --- Discovery

Recommendations

Genre exploration

Similar artists

Phase 7 --- Fun Features

Music personality

Music story

Assistant

Phase 8 --- Polish

Animations

Responsive design

Error states

Performance

Security review

Deployment

19. Coding Standards

TypeScript wherever practical.

Avoid any unless unavoidable.

Use reusable components.

Keep business logic outside UI components.

Keep Spotify API integration separate from analytics.

Validate external API data.

Use clear naming.

Add comments only where they explain non-obvious decisions.

Keep secrets out of source control.

Never hard-code user-specific data.

Do not create fake statistics.

20. Definition of Done

The application is considered successful when:

A user can securely connect Spotify.

Real Spotify data appears in the dashboard.

The application stores historical snapshots.

The application can compare different periods.

Music taste is analyzed using transparent calculations.

Recommendations are personalized.

New genres/artists can be suggested.

The story feature responds to actual listening patterns.

The UI is responsive and visually polished.

Errors and unavailable Spotify data are handled honestly.

No sensitive credentials are exposed.

Final Product Vision

The finished application should feel like a combination of:

Spotify statistics + personal music journal + recommendation engine +
music diary + playful AI assistant.

The defining feature is not simply displaying Spotify data.

It is turning listening history into a personal, evolving picture of
the user's relationship with music.