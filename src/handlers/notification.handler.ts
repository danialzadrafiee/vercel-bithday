import { Context } from 'telegraf';
import createDebug from 'debug';
import prisma from '../services/prisma.service';
import { KeyboardUtil } from '../utils/keyboard.util';

const debug = createDebug('bot:notification_handler');

export class NotificationHandler {
  async handleNotificationSettings(ctx: Context) {
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

      await ctx.reply(
        `🔔 تعداد روزهای قبل از تولد برای اطلاع رسانی را انتخاب کنید:`,
        KeyboardUtil.getNotificationDaysKeyboard()
      );
    } catch (error) {
      debug('Error handling notification settings:', error);
      await ctx.reply('❌ متاسفانه مشکلی پیش آمده است.');
    }
  }

  async updateNotificationDays(ctx: Context, days: number) {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    try {
      await prisma.user.update({
        where: { telegramId: BigInt(chatId.toString()) },
        data: { notificationDays: days },
      });
      
      return true;
    } catch (error) {
      debug('Error updating notification days:', error);
      await ctx.reply('❌ متاسفانه مشکلی در بروزرسانی تنظیمات پیش آمده است.');
      return false;
    }
  }
}

export const notificationHandler = new NotificationHandler();
