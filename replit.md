# Telegram Bot Monitor

## Overview
This project has two main components:
1. **Telegram Bot** (Python) - A Khmer-language bot that greets users and logs their data
2. **Bot Monitor Dashboard** (React + Node.js) - A web dashboard to track who is using the bot

## Architecture

### Components
- `bot.py` - Telegram bot (Python, polling mode, local)
- `api/webhook.py` - Telegram bot webhook handler for Vercel deployment
- `artifacts/bot-dashboard/` - React + Vite frontend dashboard
- `artifacts/api-server/` - Node.js Express API server (serves bot user data)

### Database
PostgreSQL with a `bot_users` table:
```sql
bot_users (
  id SERIAL PRIMARY KEY,
  telegram_id BIGINT UNIQUE NOT NULL,
  username VARCHAR(255),
  first_name VARCHAR(255),
  last_name VARCHAR(255),
  language_code VARCHAR(10),
  first_seen TIMESTAMP,
  last_seen TIMESTAMP,
  message_count INTEGER
)
```

### API Endpoints
- `GET /api/users` - List all bot users (sorted by last seen)
- `GET /api/stats` - Dashboard statistics (total, today, this week, daily chart data)
- `GET /api/healthz` - Health check

## Workflows
- **Telegram Bot** - Runs `python3 bot.py` (requires TELEGRAM_BOT_TOKEN)
- **API Server** - Runs `pnpm --filter @workspace/api-server run start` on port 3001
- **artifacts/bot-dashboard: web** - Runs Vite dev server on port 25712

## Environment Variables
- `TELEGRAM_BOT_TOKEN` - Required for the bot to run
- `DATABASE_URL` - PostgreSQL connection string (auto-set by Replit)

## Dashboard Features
- Total users, active today, new this week, active this week stats
- Area chart of new users over the last 30 days
- Full user table with name, username, Telegram ID, language, first/last seen, message count
- Auto-refreshes every 30 seconds
- Manual refresh button

## Deployment
- Bot can be deployed to Vercel (use `api/webhook.py` as the webhook handler)
- Dashboard can be deployed via Replit deployment

## Tech Stack
- Frontend: React 19, Vite, Tailwind CSS, shadcn/ui, Recharts, TanStack Query
- Backend API: Node.js, Express 5, pg (PostgreSQL client)
- Bot: Python, python-telegram-bot, psycopg2-binary
- Database: PostgreSQL (Replit built-in)
