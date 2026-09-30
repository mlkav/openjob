/**
 * Kumpulan error yang merepresentasikan kegagalan dari sisi client (4xx).
 * Setiap error membawa `statusCode` sehingga error handler global dapat
 * menerjemahkannya menjadi HTTP response yang sesuai.
 */
class ClientError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.name = 'ClientError';
    this.statusCode = statusCode;
  }
}

/** Permintaan tidak valid (payload/validasi) -> HTTP 400. */
class InvariantError extends ClientError {
  constructor(message) {
    super(message, 400);
    this.name = 'InvariantError';
  }
}

/** Kredensial/ token tidak valid -> HTTP 401. */
class AuthenticationError extends ClientError {
  constructor(message) {
    super(message, 401);
    this.name = 'AuthenticationError';
  }
}

/** Terautentikasi namun tidak memiliki hak akses -> HTTP 403. */
class AuthorizationError extends ClientError {
  constructor(message) {
    super(message, 403);
    this.name = 'AuthorizationError';
  }
}

/** Data tidak ditemukan -> HTTP 404. */
class NotFoundError extends ClientError {
  constructor(message) {
    super(message, 404);
    this.name = 'NotFoundError';
  }
}

module.exports = {
  ClientError,
  InvariantError,
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
};
