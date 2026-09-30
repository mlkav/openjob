require('dotenv').config();

const amqp = require('amqplib');
const { Pool } = require('pg');
const { performance } = require('node:perf_hooks');
const logger = require('./logger');
const APPLICATION_QUEUE = process.env.RABBITMQ_QUEUE || 'applications.created';
const RETRY_EXCHANGE = `${APPLICATION_QUEUE}.retry`;
const DEAD_LETTER_EXCHANGE = `${APPLICATION_QUEUE}.dlx`;
const DEAD_LETTER_QUEUE = `${APPLICATION_QUEUE}.dead`;
const retryDelaysMs = (
  process.env.CONSUMER_RETRY_DELAYS_MS
)
  .split(',')
  .map((value) => Number(value.trim()));
const maxRetries = retryDelaysMs.length;
const prefetchCount = Number(process.env.CONSUMER_PREFETCH ?? 5);
const applicationDateFormatter = new Intl.DateTimeFormat('id-ID', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
  timeZone: 'Asia/Jakarta',
});

const requiredSettings = [
  'RABBITMQ_HOST',
  'RABBITMQ_PORT',
  'RABBITMQ_USER',
  'RABBITMQ_PASSWORD',
  'PGUSER',
  'PGDATABASE',
  'PGHOST',
  'PGPORT',
];
const missingSettings = requiredSettings.filter((name) => !process.env[name]);

if (missingSettings.length > 0) {
  throw new Error(
    `Missing consumer configuration: ${missingSettings.join(', ')}`,
  );
}

if (
  !Number.isInteger(prefetchCount) ||
  prefetchCount < 1 ||
  prefetchCount > 20
) {
  throw new Error('CONSUMER_PREFETCH must be an integer between 1 and 20');
}

if (
  maxRetries < 1 ||
  retryDelaysMs.some((delayMs) => !Number.isInteger(delayMs) || delayMs < 1000)
) {
  throw new Error(
    'CONSUMER_RETRY_DELAYS_MS must contain integer delays of at least 1000ms',
  );
}

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  // max: prefetchCount,
});

const getApplicationNotificationData = async (applicationId) => {
  const result = await pool.query(
    `SELECT owner.name AS owner_name,
            owner.email AS owner_email,
            applicant.name AS applicant_name,
            applicant.email AS applicant_email,
            application.created_at AS application_date,
            job.title AS job_title,
            job.job_type,
            job.experience_level
     FROM applications AS application
     JOIN users AS applicant ON applicant.id = application.user_id
     JOIN jobs AS job ON job.id = application.job_id
     JOIN companies AS company ON company.id = job.company_id
     JOIN users AS owner ON owner.id = company.user_id
     WHERE application.id = $1`,
    [applicationId],
  );

  if (!result.rows[0]) {
    const error = new Error('Application or job owner not found');
    error.code = 'APPLICATION_NOT_FOUND';
    throw error;
  }

  return result.rows[0];
};

const getRetryCount = (message) => {
  const retryCount = Number(message.properties.headers?.['x-retry-count'] ?? 0);
  return Number.isInteger(retryCount) && retryCount >= 0 ? retryCount : 0;
};

const publishAndConfirm = async (
  channel,
  exchange,
  routingKey,
  message,
  headers,
) => {
  channel.publish(exchange, routingKey, message.content, {
    persistent: true,
    contentType: message.properties.contentType || 'application/json',
    headers,
  });
  await channel.waitForConfirms();
};

const routeFailedMessage = async (channel, message, error) => {
  const retryCount = getRetryCount(message);
  if (
    error.code === 'INVALID_MESSAGE' ||
    error.code === 'APPLICATION_NOT_FOUND'
  ) {
    await publishAndConfirm(
      channel,
      DEAD_LETTER_EXCHANGE,
      APPLICATION_QUEUE,
      message,
      {
        ...message.properties.headers,
        'x-dead-letter-reason': error.code,
        'x-retry-count': retryCount,
      },
    );
    return { destination: DEAD_LETTER_QUEUE, retryCount };
  }

  if (retryCount < maxRetries) {
    const nextRetryCount = retryCount + 1;
    await publishAndConfirm(
      channel,
      RETRY_EXCHANGE,
      `${APPLICATION_QUEUE}.retry.${nextRetryCount}`,
      message,
      {
        ...message.properties.headers,
        'x-retry-count': nextRetryCount,
      },
    );
    return {
      destination: `${APPLICATION_QUEUE}.retry.${nextRetryCount}`,
      retryCount: nextRetryCount,
      delayMs: retryDelaysMs[nextRetryCount - 1],
    };
  }

  await publishAndConfirm(
    channel,
    DEAD_LETTER_EXCHANGE,
    APPLICATION_QUEUE,
    message,
    {
      ...message.properties.headers,
      'x-dead-letter-reason': 'MAX_RETRIES_EXCEEDED',
      'x-retry-count': retryCount,
    },
  );
  return { destination: DEAD_LETTER_QUEUE, retryCount };
};

const handleMessage = async (channel, message, mailer) => {
  const startedAt = performance.now();
  let applicationId;
  let databaseDurationMs;
  let emailDurationMs;
  let stage = 'message_validation';
  let stageStartedAt = startedAt;
  try {
    const payload = JSON.parse(message.content.toString());
    if (
      !payload ||
      typeof payload !== 'object' ||
      Array.isArray(payload) ||
      Object.keys(payload).length !== 1 ||
      typeof payload.application_id !== 'string' ||
      payload.application_id.length === 0
    ) {
      const error = new Error(
        'Message must contain only a non-empty application_id',
      );
      error.code = 'INVALID_MESSAGE';
      throw error;
    }

    applicationId = payload.application_id;
    stage = 'database_query';
    stageStartedAt = performance.now();
    const notification = await getApplicationNotificationData(applicationId);
    databaseDurationMs = Math.round(performance.now() - stageStartedAt);
    const applicationDate = applicationDateFormatter.format(
      new Date(notification.application_date),
    );

    stage = 'email_delivery';
    stageStartedAt = performance.now();
    await mailer.sendApplicationNotification({
      ownerName: notification.owner_name,
      ownerEmail: notification.owner_email,
      applicantName: notification.applicant_name,
      applicantEmail: notification.applicant_email,
      applicationDate,
      jobTitle: notification.job_title,
      jobType: notification.job_type,
      experienceLevel: notification.experience_level,
    });
    emailDurationMs = Math.round(performance.now() - stageStartedAt);
    channel.ack(message);
    logger.info('notification.sent', {
      applicationId,
      durationMs: Math.round(performance.now() - startedAt),
      databaseDurationMs,
      emailDurationMs,
    });
  } catch (error) {
    logger.error('notification.failed', error, {
      ...(applicationId ? { applicationId } : {}),
      stage,
      stageDurationMs: Math.round(performance.now() - stageStartedAt),
      durationMs: Math.round(performance.now() - startedAt),
      ...(databaseDurationMs === undefined ? {} : { databaseDurationMs }),
      ...(emailDurationMs === undefined ? {} : { emailDurationMs }),
    });
    try {
      const routing = await routeFailedMessage(channel, message, error);
      channel.ack(message);
      logger.info('notification.failure_routed', {
        ...(applicationId ? { applicationId } : {}),
        ...routing,
      });
    } catch (routingError) {
      logger.error('rabbitmq.failure_route_failed', routingError, {
        ...(applicationId ? { applicationId } : {}),
      });
      try {
        channel.nack(message, false, true);
      } catch (nackError) {
        logger.error('rabbitmq.message_requeue_failed', nackError, {
          ...(applicationId ? { applicationId } : {}),
        });
      }
    }
  }
};

const start = async () => {
  const mailer = require('./mailer');
  const connection = await amqp.connect({
    protocol: 'amqp',
    hostname: process.env.RABBITMQ_HOST,
    port: Number(process.env.RABBITMQ_PORT),
    username: process.env.RABBITMQ_USER,
    password: process.env.RABBITMQ_PASSWORD,
  });
  let shuttingDown = false;
  connection.on('error', (error) => {
    logger.error('rabbitmq.connection_error', error);
  });
  connection.on('close', () => {
    if (!shuttingDown) {
      logger.error(
        'rabbitmq.connection_closed_unexpectedly',
        new Error('Connection closed'),
      );
      process.exitCode = 1;
      void pool.end().catch((error) => {
        logger.error('postgres.pool_close_failed', error);
      });
    }
  });
  const channel = await connection.createConfirmChannel();
  channel.on('error', (error) => {
    logger.error('rabbitmq.channel_error', error);
  });
  await channel.assertExchange(RETRY_EXCHANGE, 'direct', { durable: true });
  await channel.assertExchange(DEAD_LETTER_EXCHANGE, 'direct', {
    durable: true,
  });
  await channel.assertQueue(APPLICATION_QUEUE, { durable: true });
  await channel.assertQueue(DEAD_LETTER_QUEUE, { durable: true });
  await channel.bindQueue(
    DEAD_LETTER_QUEUE,
    DEAD_LETTER_EXCHANGE,
    APPLICATION_QUEUE,
  );
  for (let index = 0; index < retryDelaysMs.length; index += 1) {
    const retryCount = index + 1;
    const retryQueue = `${APPLICATION_QUEUE}.retry.${retryCount}`;
    await channel.assertQueue(retryQueue, {
      durable: true,
      arguments: {
        'x-message-ttl': retryDelaysMs[index],
        'x-dead-letter-exchange': '',
        'x-dead-letter-routing-key': APPLICATION_QUEUE,
      },
    });
    await channel.bindQueue(retryQueue, RETRY_EXCHANGE, retryQueue);
  }
  await channel.prefetch(prefetchCount);
  await channel.consume(APPLICATION_QUEUE, (message) => {
    if (message) {
      void handleMessage(channel, message, mailer);
    }
  });
  logger.info('consumer.ready', {
    queue: APPLICATION_QUEUE,
    prefetch: prefetchCount,
    retryDelaysMs,
    deadLetterQueue: DEAD_LETTER_QUEUE,
  });

  const shutdown = async () => {
    shuttingDown = true;
    try {
      await channel.close();
    } catch (error) {
      logger.error('consumer.channel_close_failed', error);
      process.exitCode = 1;
    }
    try {
      await connection.close();
    } catch (error) {
      logger.error('consumer.connection_close_failed', error);
      process.exitCode = 1;
    }
    await pool.end();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
};

start().catch(async (error) => {
  logger.error('consumer.startup_failed', error);
  await pool.end();
  process.exitCode = 1;
});
