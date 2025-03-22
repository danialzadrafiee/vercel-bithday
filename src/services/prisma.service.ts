import { PrismaClient } from '@prisma/client';
import createDebug from 'debug';

const debug = createDebug('bot:prisma');

// Singleton pattern for PrismaClient
class PrismaService extends PrismaClient {
  private static instance: PrismaService;

  private constructor() {
    super();
    debug('PrismaService initialized');
    this.$connect()
      .then(() => debug('Connected to database'))
      .catch((err) => debug('Failed to connect to database', err));
  }

  public static getInstance(): PrismaService {
    if (!PrismaService.instance) {
      PrismaService.instance = new PrismaService();
    }
    return PrismaService.instance;
  }

  public async disconnect(): Promise<void> {
    await this.$disconnect();
    debug('Disconnected from database');
  }
}

export default PrismaService.getInstance();
