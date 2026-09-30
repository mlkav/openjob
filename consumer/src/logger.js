const summarizeError = (error) => {
  const message = String(error?.message || error)
    .replace(/\s+/g, ' ')
    .trim();

  if (/wrong version number|tls_validate_record_header/i.test(message)) {
    return {
      code: error?.code,
      message: 'SMTP connection failed: TLS protocol mismatch',
    };
  }

  return {
    ...(error?.code ? { code: error.code } : {}),
    message: message.slice(0, 180),
  };
};

const write = (level, event, fields = {}) => {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    event,
    ...fields,
  };
  const output = level === 'error' ? console.error : console.log;
  output(JSON.stringify(entry));
};

module.exports = {
  info: (event, fields) => write('info', event, fields),
  error: (event, error, fields = {}) =>
    write('error', event, {
      ...fields,
      error: summarizeError(error),
    }),
};
