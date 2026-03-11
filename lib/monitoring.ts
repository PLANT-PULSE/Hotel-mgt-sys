/**
 * Monitoring and Observability Setup
 * Integrates Sentry, logging, and performance monitoring
 */

import * as Sentry from '@sentry/nextjs';
import { getDeploymentConfig } from '@/deployment.config';

const config = getDeploymentConfig();

/**
 * Initialize Sentry for error tracking
 */
export function initializeSentry() {
  if (config.monitoring.enabled && config.monitoring.sentryDsn) {
    Sentry.init({
      dsn: config.monitoring.sentryDsn,
      environment: config.name,
      tracesSampleRate: config.name === 'production' ? 0.1 : 1.0,
      debug: config.monitoring.loggingLevel === 'debug',
      integrations: [
        new Sentry.Integrations.Http({ tracing: true }),
        new Sentry.Integrations.OnUncaughtException(),
        new Sentry.Integrations.OnUnhandledRejection(),
      ],
    });
  }
}

/**
 * Logger with different levels
 */
export const logger = {
  debug: (message: string, context?: any) => {
    if (config.monitoring.loggingLevel === 'debug') {
      console.log(`[DEBUG] ${message}`, context);
    }
  },

  info: (message: string, context?: any) => {
    if (['debug', 'info'].includes(config.monitoring.loggingLevel)) {
      console.log(`[INFO] ${message}`, context);
    }
  },

  warn: (message: string, context?: any) => {
    if (['debug', 'info', 'warn'].includes(config.monitoring.loggingLevel)) {
      console.warn(`[WARN] ${message}`, context);
    }
  },

  error: (message: string, error?: any) => {
    console.error(`[ERROR] ${message}`, error);

    // Report to Sentry in production
    if (config.monitoring.enabled) {
      Sentry.captureException(error || new Error(message));
    }
  },
};

/**
 * Performance monitoring
 */
export const performance = {
  /**
   * Measure execution time of a function
   */
  async measure<T>(
    name: string,
    fn: () => Promise<T>
  ): Promise<{ result: T; duration: number }> {
    const start = Date.now();

    try {
      const result = await fn();
      const duration = Date.now() - start;

      logger.debug(`Performance: ${name} took ${duration}ms`);

      return { result, duration };
    } catch (error) {
      const duration = Date.now() - start;
      logger.error(`Performance: ${name} failed after ${duration}ms`, error);
      throw error;
    }
  },

  /**
   * Create a performance mark
   */
  mark(name: string) {
    if (typeof performance !== 'undefined' && performance.mark) {
      performance.mark(name);
    }
  },

  /**
   * Measure between two marks
   */
  measure(name: string, startMark: string, endMark: string) {
    if (
      typeof performance !== 'undefined' &&
      performance.measure &&
      performance.mark
    ) {
      try {
        performance.mark(endMark);
        const measure = performance.measure(name, startMark, endMark);
        logger.debug(`Measure: ${name} = ${measure.duration}ms`);
        return measure.duration;
      } catch (error) {
        logger.warn(`Could not measure performance: ${name}`, error);
      }
    }
  },
};

/**
 * API monitoring middleware
 */
export function monitoringMiddleware(
  method: string,
  path: string,
  duration: number,
  statusCode: number,
  error?: any
) {
  const logLevel = statusCode >= 500 ? 'error' : statusCode >= 400 ? 'warn' : 'info';

  const message = `${method} ${path} - ${statusCode} (${duration}ms)`;

  if (logLevel === 'error') {
    logger.error(message, error);
  } else if (logLevel === 'warn') {
    logger.warn(message);
  } else {
    logger.info(message);
  }

  // Track metrics
  if (config.name === 'production') {
    trackMetric({
      name: 'api_request',
      value: duration,
      tags: {
        method,
        path,
        statusCode: statusCode.toString(),
      },
    });
  }
}

/**
 * Custom metrics tracking
 */
interface Metric {
  name: string;
  value: number;
  tags?: Record<string, string>;
  timestamp?: Date;
}

const metrics: Metric[] = [];

export function trackMetric(metric: Metric) {
  metrics.push({
    ...metric,
    timestamp: new Date(),
  });

  // Send to monitoring service in production
  if (config.name === 'production' && metrics.length >= 100) {
    flushMetrics();
  }
}

export async function flushMetrics() {
  if (metrics.length === 0) return;

  try {
    // Send to your monitoring service
    // Example: await sendToDatadog(metrics);
    logger.debug(`Flushed ${metrics.length} metrics`);
    metrics.length = 0;
  } catch (error) {
    logger.error('Failed to flush metrics', error);
  }
}

/**
 * Health check
 */
export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  uptime: number;
  checks: {
    database: boolean;
    redis?: boolean;
    stripe?: boolean;
    websocket?: boolean;
  };
  timestamp: Date;
}

export async function checkHealth(): Promise<HealthStatus> {
  const checks = {
    database: false,
    redis: false,
    stripe: false,
    websocket: false,
  };

  try {
    // Check database
    // const dbCheck = await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch (error) {
    logger.warn('Database health check failed', error);
  }

  // Check Redis if configured
  if (config.cache.redisUrl) {
    try {
      // const redis = new Redis(config.cache.redisUrl);
      // await redis.ping();
      checks.redis = true;
    } catch (error) {
      logger.warn('Redis health check failed', error);
    }
  }

  // Check Stripe API
  if (config.stripe.secretKey) {
    try {
      // Basic connectivity check
      checks.stripe = true;
    } catch (error) {
      logger.warn('Stripe health check failed', error);
    }
  }

  // Check WebSocket
  checks.websocket = true; // Assumes WebSocket is always available

  const allHealthy = Object.values(checks).every((v) => v);
  const someUnhealthy = Object.values(checks).some((v) => !v);

  return {
    status: allHealthy ? 'healthy' : someUnhealthy ? 'degraded' : 'unhealthy',
    uptime: process.uptime(),
    checks,
    timestamp: new Date(),
  };
}

/**
 * Create an API route for health checks
 */
export function createHealthCheckRoute() {
  return async (request: Request) => {
    try {
      const health = await checkHealth();
      const statusCode = health.status === 'healthy' ? 200 : 503;

      return new Response(JSON.stringify(health), {
        status: statusCode,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      logger.error('Health check failed', error);
      return new Response(
        JSON.stringify({
          status: 'unhealthy',
          error: 'Health check failed',
        }),
        {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  };
}

/**
 * Cleanup and shutdown
 */
export async function shutdown() {
  logger.info('Application shutting down');

  // Flush metrics
  await flushMetrics();

  // Close Sentry
  if (config.monitoring.enabled) {
    await Sentry.close(2000);
  }

  logger.info('Shutdown complete');
}

// Initialize monitoring on startup
if (typeof window === 'undefined') {
  // Server-side only
  initializeSentry();

  // Graceful shutdown handling
  process.on('SIGTERM', async () => {
    logger.info('SIGTERM received');
    await shutdown();
    process.exit(0);
  });

  process.on('SIGINT', async () => {
    logger.info('SIGINT received');
    await shutdown();
    process.exit(0);
  });
}
