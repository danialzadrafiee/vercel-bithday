import { Context as TelegrafContext } from 'telegraf';

declare module 'telegraf' {
  interface Context extends TelegrafContext {
    startPayload?: string;
  }
}
