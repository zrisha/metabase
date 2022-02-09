const pgknex = require('knex')({
  client: 'pg',
  version: '13.3',
  connection: {
    host : process.env.POSTGRES_HOST || '127.0.0.1',
    port : process.env.POSTGRES_DB_PORT || 5432,
    user : process.env.POSTGRES_LOG_USER,
    password : process.env.POSTGRES_LOG_PASSWORD,
    database : process.env.POSTGRES_LOG_DB
  }
});

module.exports = pgknex