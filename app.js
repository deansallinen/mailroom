const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const uuidv4 = require('uuid/v4');
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

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

app.post('/api/v1/parcels', async (req, res, next) => {
  try {
    const uuid = uuidv4();
    const db = await dbPromise;
    const parcels = await db.run(
      `INSERT INTO parcels (
            user_id,
            street_address,
            recipient_name,
            recipient_first_name,
            recipient_last_name,
            organization_name,
            city,
            state_or_province,
            country,
            postal_code,
            barcode,
            parcel_status,
            creation_date) 
        VALUES (       
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
      [
        req.body.user_id,
        req.body.street_address,
        req.body.recipient_name,
        req.body.recipient_first_name,
        req.body.recipient_last_name,
        req.body.organization_name,
        req.body.city,
        req.body.state_or_province,
        req.body.country,
        req.body.postal_code,
        uuid,
        req.body.parcel_status,
        new Date().toISOString()
      ]
    );
    res.send(uuid);
  } catch (err) {
    next(err);
  }
});

module.exports = app;
