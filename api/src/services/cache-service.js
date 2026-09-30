/**
 * Service cache Redis.
 * Mengelola koneksi Redis dan operasi cache. Gangguan Redis dicatat dan
 * diperlakukan sebagai cache miss agar pembacaan API tetap dapat dilanjutkan.
 */
const { createClient } = require('redis');
const config = require('../config');

/** Masa berlaku cache 1 jam. */
const TTL_SECONDS = 60 * 60;
let client;
let connectionPromise;

/**
 * Mengambil client Redis yang siap digunakan, atau `null` bila Redis tidak
 * dikonfigurasi maupun koneksi gagal.
 *
 * @returns {Promise<object|null>}
 */
const getClient = async () => {
  if (!config.redis.host) {
    return null;
  }

  if (!client) {
    client = createClient({
      username: config.redis.username || undefined,
      password: config.redis.password || undefined,
      socket: {
        host: config.redis.host,
        port: config.redis.port,
        connectTimeout: 1000,
        reconnectStrategy: (retries) =>
          retries >= 2 ? new Error('Redis tidak tersedia') : 200,
      },
      disableOfflineQueue: true,
    });
    client.on('error', (error) => {
      console.error(
        'Kesalahan koneksi Redis; cache akan dilewati.',
        error.message,
      );
    });
  }

  if (client.isReady) {
    return client;
  }

  if (!connectionPromise) {
    const connectingClient = client;
    connectionPromise = connectingClient
      .connect()
      .then(() => connectingClient)
      .catch((error) => {
        console.error(
          'Kesalahan koneksi Redis; cache akan dilewati.',
          error.message,
        );
        if (client === connectingClient) {
          client = undefined;
        }
        return null;
      })
      .finally(() => {
        connectionPromise = undefined;
      });
  }

  return connectionPromise;
};

/**
 * Membaca dan mem-parsing nilai cache.
 *
 * @param {string} key key Redis
 * @returns {Promise<{hit: false}|{hit: true, value: *}>} status hit dan nilai
 *   hasil parsing JSON bila tersedia
 */
const get = async (key) => {
  const redisClient = await getClient();

  if (!redisClient) {
    return { hit: false };
  }

  try {
    const value = await redisClient.get(key);

    if (value === null) {
      return { hit: false };
    }

    try {
      return { hit: true, value: JSON.parse(value) };
    } catch (error) {
      console.error(`Invalid JSON in Redis cache key ${key}`, error.message);
      await redisClient.del(key);
      return { hit: false };
    }
  } catch (error) {
    console.error(
      `Kesalahan pembacaan Redis untuk key cache ${key}`,
      error.message,
    );
    return { hit: false };
  }
};

/**
 * Menyimpan nilai sebagai JSON dengan TTL bawaan.
 * Kegagalan penulisan cache dicatat dan tidak menggagalkan proses utama.
 *
 * @param {string} key key Redis
 * @param {*} value nilai yang akan diserialisasi
 * @returns {Promise<void>}
 */
const set = async (key, value) => {
  const redisClient = await getClient();

  if (!redisClient) {
    return;
  }

  try {
    await redisClient.set(key, JSON.stringify(value), { EX: TTL_SECONDS });
  } catch (error) {
    console.error(
      `Kesalahan penulisan Redis untuk key cache ${key}`,
      error.message,
    );
  }
};

/**
 * Menghapus satu atau beberapa key cache.
 * Kegagalan invalidasi cache dicatat dan tidak dilemparkan ke pemanggil.
 *
 * @param {...string} keys key Redis yang akan dihapus
 * @returns {Promise<void>}
 */
const invalidate = async (...keys) => {
  const redisClient = await getClient();

  if (!redisClient || keys.length === 0) {
    return;
  }

  try {
    await redisClient.del(keys);
  } catch (error) {
    console.error(
      `Kesalahan invalidasi Redis untuk key cache ${keys.join(', ')}`,
      error.message,
    );
  }
};

/**
 * Mengambil data dari cache atau memuatnya melalui fungsi `load` saat cache
 * miss, lalu menyimpan hasilnya ke cache.
 *
 * @param {string} key key Redis
 * @param {Function} load pemuat data yang dipanggil saat cache miss
 * @returns {Promise<{data: *, source: 'cache'|'database'}>}
 */
const remember = async (key, load) => {
  const cached = await get(key);

  if (cached.hit) {
    return { data: cached.value, source: 'cache' };
  }

  const data = await load();
  await set(key, data);
  return { data, source: 'database' };
};

/**
 * Menutup koneksi Redis yang aktif dan membersihkan state client.
 *
 * @returns {Promise<void>}
 */
const close = async () => {
  if (client?.isOpen) {
    await client.quit();
  }

  client = undefined;
  connectionPromise = undefined;
};

module.exports = {
  TTL_SECONDS,
  get,
  invalidate,
  remember,
  close,
};
