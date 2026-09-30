/**
 * Durable RabbitMQ producer for application-created events.
 */
const amqp = require('amqplib');
const config = require('../config');

const APPLICATION_QUEUE = config.rabbitmq.queue;
let connection;
let channel;
let channelPromise;

const getChannel = async () => {
  if (channel) {
    return channel;
  }

  if (
    !config.rabbitmq.host ||
    !config.rabbitmq.port ||
    !config.rabbitmq.username ||
    !config.rabbitmq.password
  ) {
    throw new Error('RabbitMQ configuration is incomplete');
  }

  if (!channelPromise) {
    channelPromise = (async () => {
      connection = await amqp.connect({
        protocol: 'amqp',
        hostname: config.rabbitmq.host,
        port: config.rabbitmq.port,
        username: config.rabbitmq.username,
        password: config.rabbitmq.password,
      });
      connection.on('error', (error) => {
        console.error('RabbitMQ connection error', error.message);
      });
      connection.on('close', () => {
        connection = undefined;
        channel = undefined;
        channelPromise = undefined;
      });
      channel = await connection.createConfirmChannel();
      channel.on('error', (error) => {
        console.error('RabbitMQ publisher channel error', error.message);
      });
      await channel.assertQueue(APPLICATION_QUEUE, { durable: true });
      return channel;
    })().catch((error) => {
      channelPromise = undefined;
      throw error;
    });
  }

  return channelPromise;
};

const serializeApplicationCreatedMessage = (applicationId) =>
  JSON.stringify({ application_id: applicationId });

const publishApplicationCreated = async (applicationId) => {
  const publisherChannel = await getChannel();
  publisherChannel.sendToQueue(
    APPLICATION_QUEUE,
    Buffer.from(serializeApplicationCreatedMessage(applicationId)),
    { persistent: true, contentType: 'application/json' },
  );
  await publisherChannel.waitForConfirms();
};

const close = async () => {
  if (channel) {
    await channel.close();
  }
  if (connection) {
    await connection.close();
  }
  connection = undefined;
  channel = undefined;
  channelPromise = undefined;
};

module.exports = {
  APPLICATION_QUEUE,
  serializeApplicationCreatedMessage,
  publishApplicationCreated,
  close,
};
