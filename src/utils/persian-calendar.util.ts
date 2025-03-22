import * as jMoment from 'moment-jalaali';

// Initialize moment-jalaali
jMoment.loadPersian();

export class PersianCalendarUtil {
  static isValidYear(year: number): boolean {
    return year >= 1300 && year <= 1402;
  }

  static isValidMonth(month: number): boolean {
    return month >= 1 && month <= 12;
  }

  static isValidDay(year: number, month: number, day: number): boolean {
    if (day < 1 || day > 31) return false;
    if (month > 6 && day === 31) return false;
    if (month === 12) {
      const isLeapYear = jMoment.jIsLeapYear(year);
      if (!isLeapYear && day > 29) return false;
      if (isLeapYear && day > 30) return false;
    }
    return true;
  }

  static getPersianMonthName(month: number): string {
    const months = [
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ];
    return months[month - 1];
  }

  static getDaysUntilBirthday(birthMonth: number, birthDay: number): number {
    const today = jMoment();
    const thisYear = parseInt(today.format('jYYYY'));
    let birthday = jMoment(`${thisYear}-${birthMonth}-${birthDay}`, 'jYYYY-jM-jD');

    if (birthday.isBefore(today)) {
      birthday = jMoment(`${thisYear + 1}-${birthMonth}-${birthDay}`, 'jYYYY-jM-jD');
    }

    return birthday.diff(today, 'days');
  }

  static getMonthNumber(monthName: string): number | null {
    const monthNames = [
      'فروردین',
      'اردیبهشت',
      'خرداد',
      'تیر',
      'مرداد',
      'شهریور',
      'مهر',
      'آبان',
      'آذر',
      'دی',
      'بهمن',
      'اسفند',
    ];

    const monthIndex = monthNames.indexOf(monthName);
    return monthIndex !== -1 ? monthIndex + 1 : null;
  }
}
