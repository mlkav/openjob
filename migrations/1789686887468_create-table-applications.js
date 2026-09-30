/**
 * Migration: create applications table
 * Relasi: applications.user_id -> users.id dan applications.job_id -> jobs.id.
 * Unique constraint: satu user hanya boleh melamar satu job satu kali.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('applications', {
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
    status: {
      type: 'varchar(50)',
      notNull: true,
      default: 'pending',
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

  pgm.addConstraint('applications', 'applications_user_job_unique', {
    unique: ['user_id', 'job_id'],
  });

  pgm.createIndex('applications', 'user_id');
  pgm.createIndex('applications', 'job_id');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable('applications');
};