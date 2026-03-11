/**
 * Deployment Configuration
 * Defines deployment settings for different environments
 */

export interface DeploymentEnvironment {
  name: string;
  url: string;
  apiUrl: string;
  wsUrl: string;
  database: {
    url: string;
    ssl: boolean;
  };
  stripe: {
    publishableKey: string;
    secretKey: string;
    webhookSecret: string;
  };
  cors: {
    origins: string[];
    credentials: boolean;
  };
  rateLimit: {
    windowMs: number; // 15 minutes
    maxRequests: number; // per window
  };
  monitoring: {
    enabled: boolean;
    sentryDsn?: string;
    loggingLevel: 'debug' | 'info' | 'warn' | 'error';
  };
  cache: {
    ttl: number; // in seconds
    redisUrl?: string;
  };
  security: {
    requireHttps: boolean;
    corsEnabled: boolean;
    rateLimitEnabled: boolean;
    helmetEnabled: boolean;
    csrfProtectionEnabled: boolean;
  };
  features: {
    realTimeUpdates: boolean;
    analyticsEnabled: boolean;
    emailNotificationsEnabled: boolean;
    pushNotificationsEnabled: boolean;
  };
}

const baseConfig: Partial<DeploymentEnvironment> = {
  cors: {
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 100,
  },
};

// Development Environment
export const development: DeploymentEnvironment = {
  ...baseConfig,
  name: 'development',
  url: 'http://localhost:3000',
  apiUrl: 'http://localhost:3000/api/v1',
  wsUrl: 'ws://localhost:3000',
  database: {
    url: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/hotel_dev',
    ssl: false,
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_...',
  },
  cors: {
    origins: ['http://localhost:3000', 'http://localhost:3001'],
    credentials: true,
  },
  monitoring: {
    enabled: false,
    loggingLevel: 'debug',
  },
  cache: {
    ttl: 300, // 5 minutes
  },
  security: {
    requireHttps: false,
    corsEnabled: true,
    rateLimitEnabled: false,
    helmetEnabled: true,
    csrfProtectionEnabled: false,
  },
  features: {
    realTimeUpdates: true,
    analyticsEnabled: false,
    emailNotificationsEnabled: false,
    pushNotificationsEnabled: false,
  },
} as DeploymentEnvironment;

// Staging Environment
export const staging: DeploymentEnvironment = {
  ...baseConfig,
  name: 'staging',
  url: 'https://staging-hotel.vercel.app',
  apiUrl: 'https://staging-hotel.vercel.app/api/v1',
  wsUrl: 'wss://staging-hotel.vercel.app',
  database: {
    url: process.env.DATABASE_URL || '',
    ssl: true,
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_...',
    secretKey: process.env.STRIPE_SECRET_KEY || 'sk_test_...',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || 'whsec_test_...',
  },
  cors: {
    origins: ['https://staging-hotel.vercel.app', 'https://staging-admin.vercel.app'],
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 500,
  },
  monitoring: {
    enabled: true,
    sentryDsn: process.env.SENTRY_DSN,
    loggingLevel: 'info',
  },
  cache: {
    ttl: 600, // 10 minutes
    redisUrl: process.env.REDIS_URL,
  },
  security: {
    requireHttps: true,
    corsEnabled: true,
    rateLimitEnabled: true,
    helmetEnabled: true,
    csrfProtectionEnabled: true,
  },
  features: {
    realTimeUpdates: true,
    analyticsEnabled: true,
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: false,
  },
} as DeploymentEnvironment;

// Production Environment
export const production: DeploymentEnvironment = {
  ...baseConfig,
  name: 'production',
  url: 'https://hotel.vercel.app',
  apiUrl: 'https://hotel.vercel.app/api/v1',
  wsUrl: 'wss://hotel.vercel.app',
  database: {
    url: process.env.DATABASE_URL || '',
    ssl: true,
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    secretKey: process.env.STRIPE_SECRET_KEY || '',
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
  },
  cors: {
    origins: ['https://hotel.vercel.app', 'https://admin.hotel.vercel.app'],
    credentials: true,
  },
  rateLimit: {
    windowMs: 15 * 60 * 1000,
    maxRequests: 1000,
  },
  monitoring: {
    enabled: true,
    sentryDsn: process.env.SENTRY_DSN,
    loggingLevel: 'warn',
  },
  cache: {
    ttl: 3600, // 1 hour
    redisUrl: process.env.REDIS_URL,
  },
  security: {
    requireHttps: true,
    corsEnabled: true,
    rateLimitEnabled: true,
    helmetEnabled: true,
    csrfProtectionEnabled: true,
  },
  features: {
    realTimeUpdates: true,
    analyticsEnabled: true,
    emailNotificationsEnabled: true,
    pushNotificationsEnabled: true,
  },
} as DeploymentEnvironment;

// Get current environment configuration
export function getDeploymentConfig(): DeploymentEnvironment {
  const env = process.env.NODE_ENV || 'development';

  switch (env) {
    case 'production':
      return production;
    case 'staging':
      return staging;
    case 'development':
    default:
      return development;
  }
}

// Validation function
export function validateDeploymentConfig(config: DeploymentEnvironment): string[] {
  const errors: string[] = [];

  // Database URL required
  if (!config.database.url) {
    errors.push('DATABASE_URL is required');
  }

  // Stripe keys required in production
  if (config.name === 'production') {
    if (!config.stripe.publishableKey) {
      errors.push('STRIPE_PUBLISHABLE_KEY is required in production');
    }
    if (!config.stripe.secretKey) {
      errors.push('STRIPE_SECRET_KEY is required in production');
    }
    if (!config.stripe.webhookSecret) {
      errors.push('STRIPE_WEBHOOK_SECRET is required in production');
    }
  }

  // HTTPS required in production
  if (config.name === 'production' && !config.url.startsWith('https://')) {
    errors.push('Production environment must use HTTPS');
  }

  // WebSocket URL validation
  if (config.wsUrl && !config.wsUrl.match(/^wss?:\/\//)) {
    errors.push('Invalid WebSocket URL format');
  }

  return errors;
}

// Export default configuration
export default getDeploymentConfig();
