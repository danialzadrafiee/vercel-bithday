import { Context } from 'telegraf';
import createDebug from 'debug';
import prisma from '../services/prisma.service';

const debug = createDebug('bot:user_handler');

export class UserHandler {
  async handleShowPoints(ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(chatId.toString()) },
      });

      if (!user) {
        await ctx.reply('❌ کاربر یافت نشد.');
        return;
      }

      const referredCount = await prisma.user.count({
        where: { referredById: user.id },
      });

      const message = `
👑 امتیاز شما: ${user.points}

📊 آمار دعوت‌های شما:
👥 تعداد افراد دعوت شده: ${referredCount}

💡 نحوه کسب امتیاز:
• به ازای هر دعوت موفق: 250 امتیاز
`;

      await ctx.reply(message);
    } catch (error) {
      debug('Error fetching points:', error);
      await ctx.reply('❌ متاسفانه مشکلی پیش آمده است.');
    }
  }

  async handleSupport(ctx: Context) {
    await ctx.reply('💬 برای پشتیبانی به این آیدی پیام دهید: https://t.me/developerpie_support');
  }
}

export const userHandler = new UserHandler();
