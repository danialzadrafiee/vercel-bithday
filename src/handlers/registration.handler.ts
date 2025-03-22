import { Context } from 'telegraf';
import createDebug from 'debug';
import prisma from '../services/prisma.service';
import { KeyboardUtil } from '../utils/keyboard.util';
import { PersianCalendarUtil } from '../utils/persian-calendar.util';

const debug = createDebug('bot:registration_handler');

export class RegistrationHandler {
  async handleStart(ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;

    const chatId = ctx.chat?.id;
    if (!chatId) return;

    // Extract referral code from /start command if present
    const message = ctx.message.text;
    const referralCode = message.startsWith('/start') && message.includes(' ') 
      ? message.split(' ')[1].trim() 
      : 'startPayload' in ctx ? ctx.startPayload : null;
    
    debug('Extracted referral code:', referralCode);

    try {
      let user = await prisma.user.findUnique({
        where: { telegramId: BigInt(chatId.toString()) },
      });

      if (!user) {
        const from = ctx.from;
        if (!from) return;

        user = await prisma.user.create({
          data: {
            telegramId: BigInt(chatId.toString()),
            username: from.username,
            firstName: from.first_name,
            lastName: from.last_name,
            languageCode: from.language_code,
            registrationStep: 'YEAR',
          },
        });

        if (referralCode && typeof referralCode === 'string') {
          try {
            const referrerTelegramId = BigInt(referralCode);

            const referrer = await prisma.user.findUnique({
              where: { telegramId: referrerTelegramId },
            });

            if (referrer) {
              await prisma.user.update({
                where: { id: user.id },
                data: { referredById: referrer.id },
              });

              await ctx.telegram.sendMessage(
                referrerTelegramId.toString(),
                `🎉 کاربر جدیدی با لینک دعوت شما وارد ربات شد!`,
              );
            } else {
              await ctx.reply(
                `❌ کد معرف وارد شده معتبر نیست. کاربری با این شناسه تلگرام یافت نشد.`,
              );
            }
          } catch (error) {
            debug('Error processing referral code:', error);
            await ctx.reply(
              `❌ کد معرف وارد شده نامعتبر است.`,
            );
          }
        }

        await ctx.reply(
          '🎂 لطفاً سال تولد خود را وارد کنید (مثال: 1377)',
        );
      } else {
        await this.sendMainMenu(ctx, '🎉 شما قبلاً در ربات ثبت نام کرده‌اید!');
      }
    } catch (error) {
      debug('Error handling start command:', error);
      await ctx.reply('❌ متاسفانه مشکلی پیش آمده است.');
    }
  }

  async handleYearInput(ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;
    
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    
    const year = parseInt(ctx.message.text);
    
    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(chatId.toString()) },
      });
      
      if (!user || user.registrationStep !== 'YEAR') return;
      
      if (!PersianCalendarUtil.isValidYear(year)) {
        await ctx.reply(
          '❌ سال وارد شده نامعتبر است. لطفاً سال تولد خود را به صورت عدد 4 رقمی وارد کنید (مثال: 1377)',
        );
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          birthYear: year,
          registrationStep: 'MONTH',
        },
      });

      await ctx.reply('🌙 ماه تولد خود را انتخاب کنید:', 
        KeyboardUtil.getMonthKeyboard()
      );
    } catch (error) {
      debug('Error handling year input:', error);
      await ctx.reply('❌ متاسفانه مشکلی پیش آمده است.');
    }
  }

  async handleMonthInput(ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;
    
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    
    const monthName = ctx.message.text;
    const month = PersianCalendarUtil.getMonthNumber(monthName);
    
    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(chatId.toString()) },
      });
      
      if (!user || user.registrationStep !== 'MONTH') return;

      if (!month) {
        await ctx.reply(
          '❌ لطفاً ماه تولد خود را از لیست انتخاب کنید.',
        );
        return;
      }

      await prisma.user.update({
        where: { id: user.id },
        data: {
          birthMonth: month,
          registrationStep: 'DAY',
        },
      });

      await ctx.reply('📅 روز تولد خود را انتخاب کنید:', 
        KeyboardUtil.getDayKeyboard(user.birthYear!, month)
      );
    } catch (error) {
      debug('Error handling month input:', error);
      await ctx.reply('❌ متاسفانه مشکلی پیش آمده است.');
    }
  }

  async handleDayInput(ctx: Context) {
    if (!ctx.message || !('text' in ctx.message)) return;
    
    const chatId = ctx.chat?.id;
    if (!chatId) return;
    
    const day = parseInt(ctx.message.text.replace(/[^0-9]/g, ''));
    
    try {
      const user = await prisma.user.findUnique({
        where: { telegramId: BigInt(chatId.toString()) },
      });
      
      if (!user || user.registrationStep !== 'DAY' || !user.birthYear || !user.birthMonth) return;

      if (!PersianCalendarUtil.isValidDay(user.birthYear, user.birthMonth, day)) {
        await ctx.reply(
          '❌ روز وارد شده نامعتبر است. لطفاً روز تولد خود را از لیست انتخاب کنید',
        );
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
          birthDay: day,
          registrationStep: null,
        },
      });

      if (updatedUser.referredById) {
        const referrer = await prisma.user.findUnique({
          where: { id: updatedUser.referredById },
        });

        if (referrer) {
          await prisma.user.update({
            where: { id: referrer.id },
            data: {
              points: {
                increment: 250,
              },
            },
          });

          await ctx.telegram.sendMessage(
            referrer.telegramId.toString(),
            `🎉 تبریک! کاربر دعوت شده توسط شما اطلاعات تولد خود را تکمیل کرد و 250 امتیاز دریافت کردید!`,
          );
        }
      }

      await this.sendMainMenu(
        ctx,
        `✅ تبریک! اطلاعات تولد شما با موفقیت ثبت شد.`,
      );
    } catch (error) {
      debug('Error handling day input:', error);
      await ctx.reply('❌ متاسفانه مشکلی پیش آمده است.');
    }
  }

  async sendMainMenu(ctx: Context, messageText: string) {
    await ctx.reply(messageText, KeyboardUtil.getMainKeyboard());
  }
}

export const registrationHandler = new RegistrationHandler();
