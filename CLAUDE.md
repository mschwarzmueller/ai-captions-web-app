# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Video Captioneer is a web application for uploading MP4 videos and automatically generating captions/transcriptions using the ElevenLabs Speech-to-Text API. Built with React Router v7, it features server-side rendering, drag-and-drop uploads, and real-time progress tracking.

## Development Commands

```bash
# Development
bun -b run dev          # Start development server on port 5173

# Build & Production
bun -b run build        # Build for production
bun -b run start        # Start production server

# Database
bun -b run db:generate  # Generate Drizzle migrations
bun -b run db:migrate   # Apply database migrations

# Code Quality
bun -b run typecheck    # Run TypeScript type checking
```

## Architecture

### Tech Stack
- **Framework**: React Router v7 with SSR
- **Database**: SQLite + Drizzle ORM
- **Storage**: Cloudflare R2 (S3-compatible)
- **Auth**: Better Auth with session-based authentication
- **Transcription**: ElevenLabs API with speaker diarization
- **UI**: Tailwind CSS v4 + shadcn/ui components

### Key Architectural Patterns

1. **Route-Based Code Splitting**: Each route in `/app/routes` is automatically code-split by React Router.

2. **API Routes**: Backend endpoints are colocated with frontend routes using `.server.ts` files or `resource` routes.

3. **Authentication Middleware**: Uses React Router's unstable middleware feature to protect routes. Auth state is managed through Better Auth library.

4. **Video Upload Flow**:
   - Client requests presigned URL from `/api/presign`
   - Direct upload to R2 using XHR (for progress tracking)
   - Post-upload transcription via `/api/transcribe`
   - Results currently saved to `transcription.json`

5. **Database Schema**: Located in `/app/lib/db/`. Uses Drizzle ORM with SQLite. Auth tables are managed by Better Auth.

## Environment Variables

Required environment variables:
- `BETTER_AUTH_SECRET` - Authentication secret key
- `BETTER_AUTH_URL` - Application base URL
- `DB_FILE_NAME` - SQLite database file path
- `R2_ACCOUNT_ID` - Cloudflare R2 account ID
- `R2_ACCESS_KEY_ID` - R2 access key
- `R2_SECRET_ACCESS_KEY` - R2 secret key
- `ELEVENLABS_API_KEY` - ElevenLabs API key

## Important Context

- The project is in early development with "basic functionality, full of bugs and missing features"
- TypeScript strict mode is enabled
- SSR is enabled by default in `react-router.config.ts`
- The app uses Bun as the package manager (indicated by bun.lock)
- Transcription results are temporarily stored in `transcription.json` - this likely needs a proper database implementation