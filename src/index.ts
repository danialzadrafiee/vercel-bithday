import { Telegraf } from 'telegraf';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { development, production } from './core';
import { about } from './commands';
import { 
  birthdayHandler, 
  messageHandler, 
  registrationHandler 
} from './handlers';
import createDebug from 'debug';

const debug = createDebug('bot:main');
const BOT_TOKEN = process.env.BOT_TOKEN || '';
const ENVIRONMENT = process.env.NODE_ENV || '';

const bot = new Telegraf(BOT_TOKEN);

// Commands
bot.command('about', about());
bot.command('start', (ctx) => registrationHandler.handleStart(ctx));

// Message handling
bot.on('message', (ctx) => messageHandler.handleMessage(ctx));

// Schedule birthday notifications (in development mode)
const scheduleBirthdayNotifications = async () => {
  try {
    debug('Sending birthday notifications...');
    await birthdayHandler.sendBirthdayNotifications(bot);
    debug('Birthday notifications sent successfully');
  } catch (error) {
    debug('Error sending birthday notifications:', error);
  }
};

// Production mode (Vercel)
export const startVercel = async (req: VercelRequest, res: VercelResponse) => {
  await production(req, res, bot);
};

// Development mode
if (ENVIRONMENT !== 'production') {
  development(bot);
  
  // Schedule birthday notifications every day at midnight
  setInterval(scheduleBirthdayNotifications, 24 * 60 * 60 * 1000);
  
  // Run once at startup for testing
  scheduleBirthdayNotifications();
}
