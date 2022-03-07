const express = require('express');
const pgknex = require('./knex.js');
const routes = express.Router();


// define the route for user activity
routes.post('/activity', function (req, res) {
  const { user_id, activity } = req.body;

  if(!activity) {
    res.status(400).send("Error no activity property found on request");
    return
  }
  //If log passed, insert into database
  pgknex('user_activity').insert({
    user_id,
    activity
  })
  .then(result => res.send({data: result.data, status: result.status}))
  .catch(err => {
    console.log(err);
    res.status(400).send(err)
  });
});

// define the route for queries
routes.post('/query', function (req, res) {
  const { user_id, query, json_query } = req.body;

  if(!query) {
    res.status(400).send("Error no activity property found on request");
    return
  }
  //If log passed, insert into database
  pgknex('user_queries').insert({
    user_id,
    query,
    json_query
  })
  .then(result => res.send({data: result.data, status: result.status}))
  .catch(err => {
    console.log(err);
    res.status(400).send(err)
  });
});

routes.post('/pageview', function (req, res) {
  const { user_id, url } = req.body;

  if(!url) {
    res.status(400).send("Error no url property found on request");
    return
  }
  //If log passed, insert into database
  pgknex('page_views').insert({
    user_id,
    url
  })
  .then(result => res.send({data: result.data, status: result.status}))
  .catch(err => {
    console.log(err);
    res.status(400).send(err)
  });
});

module.exports = routes;