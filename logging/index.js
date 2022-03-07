require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes.js');
const cors = require('cors');

const app = express();

if(process.env.NODE_ENV !== "production"){
  const cors = require('cors');
  app.use(cors());
  console.log('using cors');
}

app.use(bodyParser.json());
app.use(routes);


const port = process.env.PORT || 4987

// Connection To Database
const pgknex = require('./knex.js');

pgknex.raw("SELECT 1").then(() => {
  console.log("PostgreSQL connected");
  app.listen(port, () => console.log(`App listening on port ${port}!`));

  pgknex.schema.hasTable('user_activity').then((exists) => {
    if (!exists) {
      return pgknex.schema.createTable('user_activity', (table) => {
        table.increments();
        table.integer('user_id');
        table.jsonb('activity');
        table.timestamp('created_at', { precision: 3 }).defaultTo(pgknex.fn.now(3));
      });
    }
  });

  pgknex.schema.hasTable('user_queries').then((exists) => {
    if (!exists) {
      return pgknex.schema.createTable('user_queries', (table) => {
        table.increments();
        table.integer('user_id');
        table.text('query');
        table.jsonb('json_query');
        table.timestamp('created_at', { precision: 3 }).defaultTo(pgknex.fn.now(3));
      });
    }
  });

  pgknex.schema.hasTable('page_views').then((exists) => {
    if (!exists) {
      return pgknex.schema.createTable('page_views', (table) => {
        table.increments();
        table.integer('user_id');
        table.text('url');
        table.timestamp('created_at', { precision: 3 }).defaultTo(pgknex.fn.now(3));
      });
    }
  });
})
.catch((e) => {
  console.log("PostgreSQL not connected");
  console.error(e);
});
