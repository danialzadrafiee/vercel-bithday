import { Context } from 'telegraf';
import createDebug from 'debug';
import { birthdayHandler } from './birthday.handler';
import { notificationHandler } from './notification.handler';
import { userHandler } from './user.handler';
import { registrationHandler } from './registration.handler';
import prisma from '../services/prisma.service';

const debug = createDebug('bot:message_handler');

export class MessageHandler {
  async handleMessage(ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;
    
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    
    const text = ctx.message.text;

    switch (text) {
      case '➕ ثبت تولد جدید':
        await birthdayHandler.handleRegisterNewBirthday(ctx);
        return;
      case '👁️ مشاهده تولدهای ثبت شده':
        await birthdayHandler.handleViewBirthdays(ctx);
        return;
      case '🗓️ تولد های نزدیک':
        await birthdayHandler.handleUpcomingBirthdays(ctx);
        return;
      case '🔔 تنظیمات اعلان':
        await notificationHandler.handleNotificationSettings(ctx);
        return;
      case '💬 پشتیبانی':
        await userHandler.handleSupport(ctx);
        return;
      case '👑 امتیاز من':
        await userHandler.handleShowPoints(ctx);
        return;
      case '✅ تأیید':
        // Handle confirmation
        break;
      case '❌ لغو':
        // Handle cancellation
        await registrationHandler.sendMainMenu(ctx, 'عملیات لغو شد');
        break;
      case 'بله ✅':
        // Handle yes
        break;
      case 'خیر ❌':
        // Handle no
        break;
      case '🔔 1 روز قبل':
        if (await notificationHandler.updateNotificationDays(ctx, 1)) {
          await registrationHandler.sendMainMenu(
            ctx,
            `✅ تنظیمات اطلاع رسانی با موفقیت به 1 روز تغییر یافت.`,
          );
        }
        return;
      case '🔔 3 روز قبل':
        if (await notificationHandler.updateNotificationDays(ctx, 3)) {
          await registrationHandler.sendMainMenu(
            ctx,
            `✅ تنظیمات اطلاع رسانی با موفقیت به 3 روز تغییر یافت.`,
          );
        }
        return;
      case '🔔 7 روز قبل':
        if (await notificationHandler.updateNotificationDays(ctx, 7)) {
          await registrationHandler.sendMainMenu(
            ctx,
            `✅ تنظیمات اطلاع رسانی با موفقیت به 7 روز تغییر یافت.`,
          );
        }
        return;
      case '🔔 14 روز قبل':
        if (await notificationHandler.updateNotificationDays(ctx, 14)) {
          await registrationHandler.sendMainMenu(
            ctx,
            `✅ تنظیمات اطلاع رسانی با موفقیت به 14 روز تغییر یافت.`,
          );
        }
        return;
      case '🔕 بدون اعلان':
        if (await notificationHandler.updateNotificationDays(ctx, 0)) {
          await registrationHandler.sendMainMenu(ctx, `✅ اعلانات غیر فعال شدند.`);
        }
        return;
    }

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(chatId.toString()) },
      });

      if (!user) return;

      switch (user.registrationStep) {
        case 'YEAR':
          await registrationHandler.handleYearInput(ctx);
          break;
        case 'MONTH':
          await registrationHandler.handleMonthInput(ctx);
          break;
        case 'DAY':
          await registrationHandler.handleDayInput(ctx);
          break;
      }
    } catch (error) {
      debug('Error handling message:', error);
    }
  }
}

export const messageHandler = new MessageHandler();
