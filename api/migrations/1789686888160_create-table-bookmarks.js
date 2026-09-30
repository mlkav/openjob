/**
 * Migration: create bookmarks table
 * Relasi: bookmarks.user_id -> users.id dan bookmarks.job_id -> jobs.id.
 * Unique constraint: satu user hanya dapat menyimpan satu job satu kali.
 * Tabel ini menormalisasi relasi many-to-many antara users dan jobs.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('bookmarks', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    user_id: {
      type: 'varchar(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
    job_id: {
      type: 'varchar(50)',
      notNull: true,
      references: 'jobs(id)',
      onDelete: 'cascade',
    },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
    updated_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.addConstraint('bookmarks', 'bookmarks_user_job_unique', {
    unique: ['user_id', 'job_id'],
  });

  pgm.createIndex('bookmarks', 'user_id');
  pgm.createIndex('bookmarks', 'job_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable('bookmarks');
};
