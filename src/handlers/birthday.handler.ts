import { Context } from 'telegraf';
import createDebug from 'debug';
import prisma from '../services/prisma.service';
import { PersianCalendarUtil } from '../utils/persian-calendar.util';

const debug = createDebug('bot:birthday_handler');

export class BirthdayHandler {
  async handleRegisterNewBirthday(ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    const botUsername = ctx.botInfo.username;
    const referralLink = `https://t.me/${botUsername}?start=${chatId}`;

    const helpMessage = `
🎉 **ثبت تولد جدید** 🎉

برای ثبت تولد یک دوست، مراحل زیر را دنبال کنید:

1.  ⬇️ لینک زیر را برای دوست خود ارسال کنید.
2.  😊 از دوست خود بخواهید که ربات را استارت کند و اطلاعات تولدش را وارد نماید.
3.  🎁 پس از تکمیل ثبت نام توسط دوستتان، شما امتیاز دریافت خواهید کرد!

لینک دعوت شما:
`;

    await ctx.replyWithMarkdown(helpMessage);

    const personalizedInvite = `
💌 سلام، لطفاً روی لینک زیر کلیک کن و اطلاعات تولدت رو وارد کن تا تاریخ تولدت رو داشته باشم!
${referralLink}
    `;

    await ctx.reply(personalizedInvite);
  }

  async handleViewBirthdays(ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(chatId.toString()) },
        include: {
          referredBy: true, // Include referrer
          referredUsers: true, // Include referred users
        },
      });

      if (!user) {
        await ctx.reply('❌ کاربر یافت نشد.');
        return;
      }

      let message = 'لیست تولدهای ثبت شده: 🎂\n\n';

      // Birthdays of people who referred this user
      if (user.referredBy) {
        const referrerBirthDate = `${user.referredBy.birthYear}/${user.referredBy.birthMonth}/${user.referredBy.birthDay}`;
        message += `👤 ${user.referredBy.firstName} ${user.referredBy.lastName || ''} (@${user.referredBy.username || ''}): ${referrerBirthDate}\n`;
      }

      // Birthdays of people this user referred
      for (const referredUser of user.referredUsers) {
        const birthDate = `${referredUser.birthYear}/${referredUser.birthMonth}/${referredUser.birthDay}`;
        message += `👤 ${referredUser.firstName} ${referredUser.lastName || ''} (@${referredUser.username || ''}): ${birthDate}\n`;
      }

      if (message === 'لیست تولدهای ثبت شده: 🎂\n\n') {
        await ctx.reply('😔 هیچ تولدی ثبت نشده است.');
      } else {
        await ctx.reply(message);
      }
    } catch (error) {
      debug('Error fetching birthdays:', error);
      await ctx.reply('❌ متاسفانه مشکلی پیش آمده است.');
    }
  }

  async handleUpcomingBirthdays(ctx: Context) {
    const chatId = ctx.chat?.id;
    if (!chatId) return;

    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(chatId.toString()) },
        include: {
          referredBy: true, // Include referrer
          referredUsers: true, // Include referred users
        },
      });

      if (!user) {
        await ctx.reply('❌ کاربر یافت نشد.');
        return;
      }

      let message = '🎉 تولدهای نزدیک: (تا ۳۰ روز آینده)\n\n';

      // Upcoming birthday of the referrer
      if (
        user.referredBy &&
        user.referredBy.birthMonth &&
        user.referredBy.birthDay
      ) {
        const referrerDaysUntil = PersianCalendarUtil.getDaysUntilBirthday(
          user.referredBy.birthMonth,
          user.referredBy.birthDay,
        );
        if (referrerDaysUntil <= 30 && referrerDaysUntil >= 0) {
          const referrerBirthDate = `${user.referredBy.birthYear}/${user.referredBy.birthMonth}/${user.referredBy.birthDay}`;
          message += `👤 ${user.referredBy.firstName} ${user.referredBy.lastName || ''} (معرف): ${referrerBirthDate} (${referrerDaysUntil} روز)\n`;
        }
      }

      // Upcoming birthdays of referred users
      for (const referredUser of user.referredUsers) {
        if (referredUser.birthMonth && referredUser.birthDay) {
          // Check if birthMonth and birthDay exist
          const daysUntil = PersianCalendarUtil.getDaysUntilBirthday(
            referredUser.birthMonth,
            referredUser.birthDay,
          );
          if (daysUntil <= 30 && daysUntil >= 0) {
            const birthDate = `${referredUser.birthYear}/${referredUser.birthMonth}/${referredUser.birthDay}`;
            message += `👤 ${referredUser.firstName} ${referredUser.lastName || ''}: ${birthDate} (${daysUntil} روز)\n`;
          }
        }
      }

      if (message === '🎉 تولدهای نزدیک: (تا ۳۰ روز آینده)\n\n') {
        await ctx.reply('😔 هیچ تولد نزدیکی ثبت نشده است.');
      } else {
        await ctx.reply(message);
      }
    } catch (error) {
      debug('Error fetching upcoming birthdays:', error);
      await ctx.reply('❌ متاسفانه مشکلی پیش آمده است.');
    }
  }

  async sendBirthdayNotifications(bot: any) {
    try {
      const users = await prisma.user.findMany({
        where: {
          birthMonth: { not: null },
          birthDay: { not: null },
        },
        include: {
          referredBy: true, // Include the referrer
          referredUsers: true, // Include users referred by this user
        },
      });

      for (const user of users) {
        const daysUntil = PersianCalendarUtil.getDaysUntilBirthday(
          user.birthMonth!,
          user.birthDay!,
        );

        // Notify the user about their own birthday
        if (daysUntil <= user.notificationDays && daysUntil >= 0) {
          const userMessage =
            daysUntil === 0
              ? `🎉🎂 امروز تولد شماست! تولدتان مبارک! 🎂🎉`
              : `🎂 ${daysUntil} روز تا تولد شما باقی مانده است!`;

          await bot.telegram.sendMessage(user.telegramId.toString(), userMessage);
        }

        // Notify the user about their referrer's birthday
        if (
          user.referredBy &&
          user.referredBy.birthMonth &&
          user.referredBy.birthDay
        ) {
          const referrerDaysUntil = PersianCalendarUtil.getDaysUntilBirthday(
            user.referredBy.birthMonth,
            user.referredBy.birthDay,
          );
          if (
            referrerDaysUntil <= user.notificationDays &&
            referrerDaysUntil >= 0
          ) {
            const referrerMessage =
              referrerDaysUntil === 0
                ? `🎉🎂 امروز تولد ${user.referredBy.firstName} ${user.referredBy.lastName || ''} (معرف شما) است!`
                : `🎂 ${referrerDaysUntil} روز تا تولد ${user.referredBy.firstName} ${user.referredBy.lastName || ''} (معرف شما) باقی مانده است!`;
            await bot.telegram.sendMessage(
              user.telegramId.toString(),
              referrerMessage,
            );
          }
        }

        // Notify the referrer about the user's birthday
        if (user.referredBy && user.referredById !== user.id) {
          //Different users.
          if (daysUntil <= user.referredBy.notificationDays && daysUntil >= 0) {
            const message =
              daysUntil === 0
                ? `🎉🎂 امروز تولد ${user.firstName} ${user.lastName || ''} است!`
                : `🎂 ${daysUntil} روز تا تولد ${user.firstName} ${user.lastName || ''} باقی مانده است!`;

            await bot.telegram.sendMessage(
              user.referredBy.telegramId.toString(),
              message,
            );
          }
        }
      }
    } catch (error) {
      debug('Error sending birthday notifications:', error);
    }
  }
}

export const birthdayHandler = new BirthdayHandler();
