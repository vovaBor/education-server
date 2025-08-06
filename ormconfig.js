require('dotenv').config();

module.exports = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'crm_user',
  password: process.env.DB_PASSWORD || 'crm_password',
  database: process.env.DB_NAME || 'crm_db',
  entities: ['dist/**/*.entity{.ts,.js}'],
  migrations: ['dist/migrations/*{.ts,.js}'],
  cli: {
    migrationsDir: 'src/migrations',
  },
  synchronize: false,
  logging: false,
}; 