import 'dotenv/config';

/** Centralised, validated environment configuration — read env vars nowhere else. */
export interface AppConfig {
  port: number;
  cardmarket: {
    appToken: string;
    appSecret: string;
    accessToken: string;
    accessTokenSecret: string;
    apiBaseUrl: string;
    isConfigured: boolean;
  };
  cacheTtlSeconds: number;
}

function readEnv(name: string): string {
  return process.env[name]?.trim() ?? '';
}

const appToken = readEnv('CARDMARKET_APP_TOKEN');
const appSecret = readEnv('CARDMARKET_APP_SECRET');
const accessToken = readEnv('CARDMARKET_ACCESS_TOKEN');
const accessTokenSecret = readEnv('CARDMARKET_ACCESS_TOKEN_SECRET');

export const config: AppConfig = {
  port: Number(readEnv('PORT') || 4000),
  cardmarket: {
    appToken,
    appSecret,
    accessToken,
    accessTokenSecret,
    apiBaseUrl: readEnv('CARDMARKET_API_BASE_URL') || 'https://api.cardmarket.com/ws/v2.0',
    isConfigured: Boolean(appToken && appSecret && accessToken && accessTokenSecret),
  },
  cacheTtlSeconds: Number(readEnv('CARDMARKET_CACHE_TTL_SECONDS') || 300),
};
