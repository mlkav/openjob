/**
 * Migration: create documents table
 * Menyimpan metadata berkas PDF yang diunggah user. Dokumen terhubung ke
 * pemiliknya dan akan ikut dihapus saat akun user dihapus.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.up = (pgm) => {
  pgm.createTable('documents', {
    id: { type: 'varchar(50)', primaryKey: true },
    user_id: {
      type: 'varchar(50)',
      notNull: true,
      references: 'users(id)',
      onDelete: 'cascade',
    },
    filename: { type: 'varchar(255)', notNull: true, unique: true },
    original_name: { type: 'varchar(255)', notNull: true },
    size: { type: 'integer', notNull: true },
    mime_type: { type: 'varchar(100)', notNull: true },
    created_at: {
      type: 'timestamp',
      notNull: true,
      default: pgm.func('current_timestamp'),
    },
  });

  pgm.createIndex('documents', 'user_id');
};

/**
 * Menghapus tabel dokumen saat migration ini di-rollback.
 *
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 */
exports.down = (pgm) => {
  pgm.dropTable('documents');
};
