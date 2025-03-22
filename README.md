# Telegram Birthday Bot

A Telegram bot that helps users track birthdays of friends and family. The bot sends notifications before upcoming birthdays and allows users to invite friends to register their birthdays.

## Features

- 🎂 Register birthdays with Persian calendar support
- 🔔 Customizable notification settings (1, 3, 7, or 14 days before birthdays)
- 👁️ View all registered birthdays
- 🗓️ See upcoming birthdays (within the next 30 days)
- 👑 Referral system with points
- 💬 Support contact

## Tech Stack

- Node.js
- Telegraf (Telegram Bot Framework)
- PostgreSQL with Prisma ORM
- Vercel for serverless deployment

## Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
   or
   ```
   pnpm install
   ```

3. Copy `.env-sample` to `.env` and fill in your values:
   ```
   cp .env-sample .env
   ```

4. Set up the database:
   ```
   npx prisma migrate dev
   ```

5. Run the bot in development mode:
   ```
   npm run dev
   ```

## Deployment

The bot is configured to deploy on Vercel. Connect your repository to Vercel and set the environment variables in the Vercel dashboard.

## License

See the [LICENSE](LICENSE) file for details.
