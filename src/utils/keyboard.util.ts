import { Markup } from 'telegraf';
import { PersianCalendarUtil } from './persian-calendar.util';

export class KeyboardUtil {
  static getMainKeyboard() {
    return Markup.keyboard([
      [{ text: '➕ ثبت تولد جدید' }],
      [{ text: '👁️ مشاهده تولدهای ثبت شده' }, { text: '🗓️ تولد های نزدیک' }],
      [{ text: '🔔 تنظیمات اعلان' }, { text: '👑 امتیاز من' }],
      [{ text: '💬 پشتیبانی' }],
    ]).resize();
  }

  static getMonthKeyboard() {
    const months = Array.from({ length: 12 }, (_, i) => i + 1);
    return Markup.keyboard(
      months.map((month) => [
        { text: `${PersianCalendarUtil.getPersianMonthName(month)}` },
      ])
    ).resize().oneTime();
  }

  static getDayKeyboard(year: number, month: number) {
    const maxDay =
      month <= 6
        ? 31
        : month === 12
          ? require('moment-jalaali').jIsLeapYear(year)
            ? 30
            : 29
          : 30;

    const days = Array.from({ length: maxDay }, (_, i) => i + 1);
    const keyboard = [];

    for (let i = 0; i < days.length; i += 5) {
      keyboard.push(
        days.slice(i, i + 5).map((day) => ({
          text: `📅 ${day}`,
        }))
      );
    }

    return Markup.keyboard(keyboard).resize().oneTime();
  }

  static getNotificationDaysKeyboard() {
    return Markup.keyboard([
      [{ text: '🔔 1 روز قبل' }, { text: '🔔 3 روز قبل' }],
      [{ text: '🔔 7 روز قبل' }, { text: '🔔 14 روز قبل' }],
      [{ text: '🔕 بدون اعلان' }],
    ]).resize().oneTime();
  }

  static getConfirmationKeyboard() {
    return Markup.keyboard([
      [{ text: '✅ تأیید' }, { text: '❌ لغو' }],
    ]).resize().oneTime();
  }

  static getYesNoKeyboard() {
    return Markup.keyboard([
      [{ text: 'بله ✅' }, { text: 'خیر ❌' }],
    ]).resize().oneTime();
  }
}
