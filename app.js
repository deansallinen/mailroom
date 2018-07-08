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

app.get('/api/v1/parcels/:barcode', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const parcels = await db.get(
      'SELECT * FROM parcels WHERE barcode = ?',
      req.params.barcode
    );
    res.send(parcels);
  } catch (err) {
    next(err);
  }
});

app.post('/api/v1/parcels', async (req, res, next) => {
  try {
    const uuid = uuidv4();
    const payload = {
      $user_id: req.body.user_id,
      $file_id: req.body.file_id,
      $street_address: req.body.street_address,
      $attn_name: req.body.attn_name,
      $attn_phone: req.body.attn_phone,
      $attn_organization: req.body.attn_organization,
      $city: req.body.city,
      $state_or_province: req.body.state_or_province,
      $country: req.body.country,
      $postal_code: req.body.postal_code,
      $shipment_status: 'created',
      $shipment_type: req.body.shipment_type,
      $shipment_locale: req.body.shipment_locale,
      $shipment_speed: req.body.shipment_speed,
      $barcode: uuid,
      $creation_date: new Date().toISOString()
    };
    const db = await dbPromise;
    const parcels = await db.run(
      `INSERT INTO parcels (
            user_id,
            file_id,
            street_address,
            attn_name,
            attn_phone,
            attn_organization,
            city,
            state_or_province,
            country,
            postal_code,
            barcode,
            shipment_status,
            shipment_type,
            shipment_locale,
            shipment_speed,
            creation_date) 
            VALUES (       
              $user_id,
            $file_id,
            $street_address,
            $attn_name,
            $attn_phone,
            $attn_organization,
            $city,
            $state_or_province,
            $country,
            $postal_code,
            $barcode,
            $shipment_status,
            $shipment_type,
            $shipment_locale,
            $shipment_speed,
            $creation_date)`,
      payload
    );
    res.send(uuid);
  } catch (err) {
    next(err);
  }
});

app.put('/api/v1/parcels/:barcode', async (req, res, next) => {
  try {
    const payload = {
      $barcode: req.params.barcode,
      $shipment_weight: req.body.shipment_weight,
      $shipment_length: req.body.shipment_length,
      $shipment_width: req.body.shipment_width,
      $shipment_height: req.body.shipment_height,
      $shipping_method: req.body.shipping_method,
      $shipment_status: req.body.shipment_status,
      $received_date: new Date().toISOString()
    };
    const db = await dbPromise;
    const parcels = await db.run(
      `UPDATE parcels SET
            shipment_weight=$shipment_weight,
            shipment_length=$shipment_length,
            shipment_width=$shipment_width,
            shipment_height=$shipment_height,
            shipping_method=$shipping_method,
            shipment_status=$shipment_status,
            received_date=$received_date
            WHERE barcode = $barcode`,
      payload
    );
    res.json(parcels.changes);
  } catch (err) {
    next(err);
  }
});

app.delete('/api/v1/parcels/:barcode', async (req, res, next) => {
  try {
    const db = await dbPromise;
    const parcels = await db.run(
      'DELETE FROM parcels WHERE barcode = ?',
      req.params.barcode
    );
    res.json(parcels);
  } catch (err) {
    next(err);
  }
});

module.exports = app;
