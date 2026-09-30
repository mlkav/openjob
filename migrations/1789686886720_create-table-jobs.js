/**
 * Migration: create jobs table
 * Relasi: jobs.company_id -> companies.id dan jobs.category_id -> categories.id.
 * Normalisasi: nama perusahaan & nama kategori tidak diduplikasi di tabel ini.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('jobs', {
    id: {
      type: 'varchar(50)',
      primaryKey: true,
    },
    company_id: {
      type: 'varchar(50)',
      notNull: true,
      references: 'companies(id)',
      onDelete: 'cascade',
    },
    category_id: {
      type: 'varchar(50)',
      notNull: true,
      references: 'categories(id)',
      onDelete: 'cascade',
    },
    title: {
      type: 'varchar(150)',
      notNull: true,
    },
    description: {
      type: 'text',
      notNull: true,
    },
    job_type: {
      type: 'varchar(30)',
      notNull: true,
    },
    experience_level: {
      type: 'varchar(30)',
      notNull: true,
    },
    location_type: {
      type: 'varchar(30)',
      notNull: true,
    },
    location_city: {
      type: 'varchar(100)',
    },
    salary_min: {
      type: 'integer',
    },
    salary_max: {
      type: 'integer',
    },
    is_salary_visible: {
      type: 'boolean',
      notNull: true,
      default: false,
    },
    status: {
      type: 'varchar(20)',
      notNull: true,
      default: 'open',
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

  pgm.addConstraint('jobs', 'jobs_job_type_check', {
    check: 'job_type IN (\'full-time\', \'part-time\', \'internship\', \'contract\', \'freelance\')',
  });

  pgm.addConstraint('jobs', 'jobs_experience_level_check', {
    check: 'experience_level IN (\'junior\', \'mid\', \'senior\', \'lead\')',
  });

  pgm.addConstraint('jobs', 'jobs_location_type_check', {
    check: 'location_type IN (\'remote\', \'onsite\', \'hybrid\')',
  });

  pgm.addConstraint('jobs', 'jobs_status_check', {
    check: 'status IN (\'open\', \'closed\', \'close\')',
  });

  pgm.addConstraint('jobs', 'jobs_salary_range_check', {
    check: '(salary_min IS NULL OR salary_min >= 0) AND (salary_max IS NULL OR salary_max >= 0) AND (salary_min IS NULL OR salary_max IS NULL OR salary_max >= salary_min)',
  });

  pgm.createIndex('jobs', 'company_id');
  pgm.createIndex('jobs', 'category_id');
  pgm.createIndex('jobs', 'title');
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable('jobs');
};