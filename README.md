# Interoffice Mailroom Webapp

## Overview

This app intends to solve a client's problem with interoffice mail. Employees will fill out address information for their letters and parcels and our app will generate a QR code which they print and attach to their mail. When the mailroom receives this letter/parcel they can then scan the QR code which will query the database for the relevant address information. The mailroom can then weigh the package, decide on the correct carrier and shipping methodology, generate the shipping label and ship the package.

## Setup

We'll start by creating a new directory on the command line with `$ mkdir mailroom` and run `$ npm install express-generator -g` to install the tool that will allow us to skeleton out our app quickly.

Run `$ express --no-view --git --force` to skeleton an app with no templating engine (because we plan on using React) as well as an empty .gitignore file and we add the force flag because the directory currently contains this markdown file.

Now we can begin installing packages for our app. First run `$ npm install` to install the packages required by express. Now would also be a good time to initialize a git repository.

Run `$ git init` and `$ git add -A` to add the beginnings of our app to the git repository, now make the first commit with `$ git commit -m "initialize repo"`. Now our app is under version control and if we make a mistake adding new features, we can easily roll back to a time when our app worked!

Okay lets test our express installation. Run `$ npm start` and open up a browser to http://localhost:3000 where you should see the following image. This means the installation was successful.

![screenshot of express default page](/screenshots/000.png)

## Database

Let's set up the database. First, stop the server with `CTRL-C`. Since we will be using Sqlite for our database we can run `$ npm install sqlite bluebird --save`. I've chosen to use sqlite instead of sqlite3 as this lets us use promises instead of callbacks to access the database. Also installed bluebird as this seems to be the consensus over ES6 promises. Not sure I like that. But lets get something working and come back to that.

Create a folder for migrations, which will be useful going forward when we want to modify the database schema `$ mkdir migrations && cd migrations`. Lets create our first migration `$ touch 001-init.sql` and write some SQL.

```sql
-- Up
CREATE TABLE parcels
(
    id INTEGER PRIMARY KEY,
    user_id TEXT,
    file_id TEXT,
    shipment_type TEXT,
    shipment_destination TEXT,
    shipment_speed TEXT,
    attn_name TEXT,
    attn_phone TEXT,
    attn_organization TEXT,
    street_address TEXT,
    city TEXT,
    state_or_province TEXT,
    country TEXT,
    postal_code TEXT,
    us_value_of_goods TEXT,
    us_content_declaration TEXT,
    barcode TEXT,
    carrier_tracking_number TEXT,
    shipment_weight INT,
    shipment_length INT,
    shipment_width INT,
    shipment_height INT,
    shipping_method TEXT,
    shipment_status TEXT,
    creation_date TEXT,
    received_date TEXT
);

INSERT INTO parcels
    (user_id, street_address, attn_name,
    attn_organization, city, state_or_province, country, postal_code, barcode)
VALUES
    ("1A", "123 Example Street", "Spiderman", "The Avengers", "New York City", "New York", "US", "12345", "f34c6658-818b-11e8-adc0-fa7ae01bbebc");

-- Down
DROP TABLE parcels;
```

Now to start we'll add our database connection in `app.js` for quicker prototyping and refactor it later:

```javascript
const Promise = require('bluebird');
const sqlite = require('sqlite');
const dbPromise = Promise.resolve()
  .then(() => sqlite.open('./mailroom.sqlite', { Promise }))
  .then(db => db.migrate({ force: 'last' }));
```

Which will create a database file in our root directory (if it doesn't already exist), add some test data, open a connection, and use the latest migration to ensure our database is using the newest schema during development.

## Writing Tests

For running tests we will install Mocha, Chai, and ChaiHTTP.

Run `$ npm install mocha -g && npm install mocha chai chai-http --save-dev` then `$ mkdir test`

## Routing

Lets start by creating a test file with `$ touch test/routes.spec.js` where we will add the tests for our API routes. First include the above libraries and tell Chai to use the HTTP module.

```javascript
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../app');

chai.use(chaiHTTP);
```

### GET

Now we can describe our first test. Let's test that when we hit the `/api/v1/parcels` URL we receive an array of all parcels in the database.

```javascript
describe('API Routes', function() {
  describe('GET /api/v1/parcels', function() {
    it('should return all parcels', function(done) {
      chai
        .request(server)
        .get('/api/v1/parcels')
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;
          res.body.should.be.a('array');
          done();
        });
    });
  });
});
```

Now if we run `$ mocha` on the command line to start our test we see the following error:

```
deans-Mac-Pro:mailroom dean$ mocha


  API Routes
    GET /api/v1/parcels
GET /api/v1/parcels 200 5.857 ms - 11
      1) should return all parcels


  0 passing (58ms)
  1 failing

  1) API Routes
       GET /api/v1/parcels
         should return all parcels:
     Uncaught AssertionError: expected 'text/html; charset=utf-8' to include 'application/json'
      at /Users/dean/Documents/projects/mailroom/test/routes.spec.js:16:25
      at Test.Request.callback (node_modules/superagent/lib/node/index.js:716:12)
      at IncomingMessage.parser (node_modules/superagent/lib/node/index.js:916:18)
      at endReadableNT (_stream_readable.js:1062:12)
      at process._tickCallback (internal/process/next_tick.js:152:19)
```

It's saying that it isn't receiving json back from the server, so let's correct that by first opening `app.js` and adding

```javascript
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
```

So now when our client hits the '/api/v1/parcels' route the server opens a connection to the database, selects all parcels from our parcels table, and sends the result back to the client.

### POST

Before we write the code that lets us add a new parcel, we need some helpers. Lets run `$ npm install uuid -s` and in `app.js` add

```javascript
const uuidv4 = require('uuid/v4');
```

Lets write another test, inside the same 'API Routes' function block just underneath the 'GET /api/v1/parcels' test, this time for posting a new parcel to the server:

```javascript
describe('POST /api/v1/parcels', function() {
    it('should create one parcel', function(done) {
      chai
        .request(server)
        .post('/api/v1/parcels')
        .send({
          user_id: 'Dean',
          street_address: '1234 Main St',
          attn_name: 'test',
          attn_organization: 'test',
          city: 'test',
          state_or_province: 'test',
          country: 'test',
          postal_code: 'test',
          barcode: '0e2887fc-19c9-4bf5-a9fc-0c5f5a23a87c',
          shipment_status: 'test',
          creation_date: 'test',
        })
        .end(function(err, res) {
          res.should.have.status(200);
          done();
        });
    });
```

Notice how we don't have every field? When we are creating a new parcel, this is the data the user will enter. When the mailroom later updates the parcel with the shipping information and the package dimensions, they will update this record.

And again we go into `app.js` to add a route:

```javascript
app.post('/api/v1/parcels', async (req, res, next) => {
  try {
    const payload = {
      $user_id: req.body.user_id,
      $street_address: req.body.street_address,
      $attn_name: req.body.attn_name,
      $recipient_first_name: req.body.recipient_first_name,
      $recipient_last_name: req.body.recipient_last_name,
      $attn_organization: req.body.attn_organization,
      $city: req.body.city,
      $state_or_province: req.body.state_or_province,
      $country: req.body.country,
      $postal_code: req.body.postal_code,
      $uuid: uuid,
      $parcel_status: req.body.parcel_status,
      $creation_date: new Date().toISOString()
    };
    const uuid = uuidv4();
    const db = await dbPromise;
    const parcels = await db.run(
      `INSERT INTO parcels (
            user_id,
            street_address,
            attn_name,
            attn_organization,
            city,
            state_or_province,
            country,
            postal_code,
            barcode,
            shipment_status,
            creation_date) 
        VALUES (       
            $user_id,
            $street_address,
            $attn_name,
            $attn_organization,
            $city,
            $state_or_province,
            $country,
            $postal_code,
            $barcode,
            $shipment_status,
            $creation_date)`,
      payload
    );
    res.send(uuid);
  } catch (err) {
    next(err);
  }
});
```

Instead of sending an array of values as the payload we can send an object with key:value pairs. Make sure to include the `$` in front of the key otherwise sqlite won't recognize it as a placeholder! (multiple hours spent trying to figure out why this wasn't working...)

Here when a client hits the `/api/v1/parcels` route with a POST request and supplies address information that is saved in the database as a new record. Notice how we are using `uuidv4()` to generate a unique code for each record. We return the uuid as the response, the idea being we will use this to generate the barcode in the front-end. We also use `new Date().toISOString()` to add a timestamp of when that record was created.

If you're wondering (like I did) why it seems like the POST request is updating and not inserting new values each time the test is run, it's because we added `{ force: 'last' }` to re-run the latest migration every time we restart our server. So even though it looks like the barcode and creation_date are changing in place, it's really:

1.  Dropping the parcels table
2.  Inserting the two sample rows in our 001-init.sql file
3.  POSTing the new row with the new data

### PUT

When a package is received by the mailroom IRL they will scan the barcode and pull up the parcel in the database to add shipping information and package dimensions.

So before we can make updates to parcels, we need to be able to GET individual parcels by their barcode.

In `routes.spec.js` we can add a new test for the new route we are about to create:

```javascript
describe('GET /api/v1/parcels/:barcode', function() {
  it('should return one parcel', function(done) {
    chai
      .request(server)
      .get('/api/v1/parcels/f34c6658-818b-11e8-adc0-fa7ae01bbebc')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('object');
        done();
      });
  });
});
```

Here we are using a barcode from one of our sample rows in the 001-init.sql file as these are static and easy to reference.

Run the test with `$ mocha` and see that it fails with a 404. Now we need to write the route. In app.js under our other routes add:

```javascript
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
```

Rerun the test and voila! 3 passing tests. You can even verify in the browser by entering http://localhost:3000/api/v1/parcels/f34c6658-818b-11e8-adc0-fa7ae01bbebc and seeing our test data.

Now that the mailroom can access a single record, we need to be able to update that record. Let's write a test. Because sqlite doesn't return the inserted row as an object, it only returns the number of rows modified, we'll test that the number of modified rows is non-zero:

```javascript
describe('PUT /api/v1/parcels/:barcode', function() {
  it('should update one parcel', function(done) {
    chai
      .request(server)
      .put('/api/v1/parcels/f34c6658-818b-11e8-adc0-fa7ae01bbebc')
      .send({
        shipment_weight: '1',
        shipment_length: '2',
        shipment_width: '3',
        shipment_height: '4',
        shipping_method: 'Expedited',
        shipment_status: 'Received'
      })
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.not.equal(0);
        done();
      });
  });
});
```

and it fails. Good. Now the route. This looks a little different than the previous route we made:

```javascript
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
```

### DELETE

Okay, now we have the ability to CREATE, READ, and UPDATE. Our envisioned use case doesn't have users deleting records, I think we would like to maintain old records for archival purposes. However, for completeness we'll add a simple DELETE route.

Let's first add another sample into our `001-init.sql` file with a static barcode. Add this ABOVE the previous insert, as we will see why in a second.

```sql
INSERT INTO parcels
    (user_id, street_address, attn_name,
    attn_organization, city, state_or_province, country, postal_code, barcode)
VALUES
    ("1A", "I SHOULD BE DELETED", "Iron Man", "The Avengers", "New York City", "New York", "US", "12345", "f34c6658-818b-11e8-adc0-fa7ae01bbebb");
```

Now let's write a test in our `routes.spec.js` file for our deletion:

```javascript
describe('DELETE /api/v1/parcels/:barcode', function() {
  it('should delete one parcel', function(done) {
    chai
      .request(server)
      .delete('/api/v1/parcels/f34c6658-818b-11e8-adc0-fa7ae01bbebb')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
      });
    chai
      .request(server)
      .get('/api/v1/parcels/')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.json;
        res.body.should.be.a('array');
        res.body[0].should.have.property('barcode');
        res.body[0].barcode.should.equal(
          'f34c6658-818b-11e8-adc0-fa7ae01bbebc'
        );
      });
    done();
  });
});
```

Here we are sending a request to the server to delete the parcel with "I SHOULD BE DELETED" as an address (note the 'bb' at the end of the barcode instead of the 'bc').

The second request to the server is to get back the full list of parcels, and if the delete works as intended, the first parcel (in position [0]) should now be our parcel with barcode ending in 'bc'.

Run the test. It fails. Now write the route.

```javascript
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
```

Run the tests...

```
deans-Mac-Pro:mailroom dean$ mocha


  API Routes
    GET /api/v1/parcels
GET /api/v1/parcels 200 5.799 ms - 1037
      ✓ should return all parcels
    GET /api/v1/parcels/:barcode
GET /api/v1/parcels/f34c6658-818b-11e8-adc0-fa7ae01bbebc 200 1.022 ms - 517
      ✓ should return one parcel
    DELETE /api/v1/parcels/:barcode
      ✓ should delete one parcel
    PUT /api/v1/parcels/:barcode
DELETE /api/v1/parcels/f34c6658-818b-11e8-adc0-fa7ae01bbebb 200 2.549 ms - 79
GET /api/v1/parcels/ 200 2.028 ms - 519
PUT /api/v1/parcels/f34c6658-818b-11e8-adc0-fa7ae01bbebc 200 1.289 ms - 1
      ✓ should update one parcel
    POST /api/v1/parcels
POST /api/v1/parcels 200 1.686 ms - 36
      ✓ should create one parcel


  5 passing (79ms)
```

And it works! Now we have a fully functional basic CRUD API.

## Front End

I would like to have the front end built with React to take advantage of component architecture, however to quickly test that everything works we can build a simple HTML page.

We should already have a page called `index.html` in our ./public folder. Let's open that up and add a basic form.

Here's what `index.html` should look like:

```html
<html>

<head>
  <title>Express</title>
  <link rel="stylesheet" href="/stylesheets/style.css">
</head>

<body>
  <h1>Express</h1>
  <p>Welcome to Express</p>

  <form action="/api/v1/parcels" method="post">
    User ID:
    <input type="text" name="user_id">
    <input type="submit" value="Submit">
  </form>

</body>

</html>
```

Now open http://localhost:3000 and try it out!

![screenshot of index](/screenshots/001.png)

So what's happening here is when you type your User ID in the text field and hit the submit button we use the POST route we made earlier to create a new record in our database.

![screenshot of barcode result](/screenshots/002.png)

As we can see by the random string of numbers and letters we receive back, we are successfully viewing the barcode of our created entry.

![screenshot of JSON from database](/screenshots/003.png)

At this point we will add additional fields from our database.

We will also add any remaining fields to the routes.

Now our webpage looks like this! (I also just learned how to take nicer screenshots of the selected window)

![screenshot of user view](/screenshots/004.png)
