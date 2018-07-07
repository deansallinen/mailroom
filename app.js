const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const app = express();

//Database
const Promise = require('bluebird');
const sqlite = require('sqlite');
const dbPromise = Promise.resolve()
  .then(() => sqlite.open('./mailroom.sqlite', { Promise }))
  .then(db => db.migrate({ force: 'last' }));

//Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(logger('dev'));
}

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.get('/api/v1/parcels', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const parcels = await db.all('SELECT * FROM parcels');
    res.send(parcels);
  } catch (err) {
    next(err);
  }
});

module.exports = app;
