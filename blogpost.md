# Interoffice Mailroom Webapp

## Overview

This app intends to solve a client's problem with interoffice mail. Employees will fill out address information for their letters and parcels and our app will generate a QR code which they print and attach to their mail. When the mailroom receives this letter/parcel they can then scan the QR code which will query the database for the relevant address information. The mailroom can then weigh the package, decide on the correct carrier and shipping methodology, generate the shipping label and ship the package.

## Setup

We'll start by creating a new directory on the command line with `mkdir mailroom` and run `npm install express-generator -g` to install the tool that will allow us to skeleton out our app quickly.

Run `express --no-view --git --force` to skeleton an app with no templating engine (because we plan on using React) as well as an empty .gitignore file and we add the force flag because the directory currently contains this markdown file.

Now we can begin installing packages for our app. First run `npm install` to install the packages required by express. Now would also be a good time to initialize a git repository.

Run `git init` and `git add -A` to add the beginnings of our app to the git repository, now make the first commit with `git commit -m "initialize repo"`. Now our app is under version control and if we make a mistake adding new features, we can easily roll back to a time when our app worked!

Okay lets test our express installation. Run `npm start` and open up a browser to http://localhost:3000 where you should see: Express Welcome to Express. This means the installation was successful.

## Database

Let's set up the database. First, stop the server with `CTRL-C`. Since we will be using Sqlite for our database we can run `npm install sqlite bluebird --save`. I've chosen to use sqlite instead of sqlite3 as this lets us use promises instead of callbacks to access the database. Also installed bluebird as this seems to be the consensus over ES6 promises. Not sure I like that. But lets get something working and come back to that.

Create a folder for migrations, which will be useful going forward when we want to modify the database schema `mkdir migrations && cd migrations`. Lets create our first migration `touch 001-init.sql` and write some SQL.

```sql
-- Up
CREATE TABLE parcels
(
    id INTEGER PRIMARY KEY,
    user_id TEXT,
    street_address TEXT,
    recipient_name TEXT,
    recipient_first_name TEXT,
    recipient_last_name TEXT,
    organization_name TEXT,
    city TEXT,
    state_or_province TEXT,
    country TEXT,
    postal_code TEXT,
    barcode TEXT,
    post_tracking_number TEXT,
    parcel_weight INT,
    parcel_length INT,
    parcel_width INT,
    parcel_height INT,
    shipping_method TEXT,
    parcel_status TEXT,
    creation_date TEXT,
    received_date TEXT
);

INSERT INTO parcels
    (user_id, street_address, recipient_name,
    organization_name, city, state_or_province, country, postal_code, barcode)
VALUES
    ("1A", "123 Example Street", "Iron Man", "The Avengers", "New York City", "New York", "US", "12345", "f34c6658-818b-11e8-adc0-fa7ae01bbebc")

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

For running tests we will install Mocha, Chai, and ChaiHTTP. Run `npm install mocha -g && npm install mocha chai chai-http --save-dev` then `mkdir test`

## Routing

Lets start by creating a test at `touch test/routes.spec.js` where we will add the tests for our API routes. First include the above libraries and tell Chai to use the HTTP module.

```javascript
const chai = require('chai');
const should = chai.should();
const chaiHttp = require('chai-http');
const server = require('../app');

chai.use(chaiHTTP);
```

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

Now if we run `mocha` on the command line to start our test we see the following error:

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

Before we write the code that lets us add a new parcel, we need some helpers. Lets run `npm install uuid -s` and in `app.js` add

```javascript
const uuidv4 = require('uuid/v4');
```

Lets write another test, inside the same 'API Routes' function block just underneath the 'GET /api/v1/parcels' test, this time for posting a new parcel to the server:

```javascript
describe('POST /api/v1/parcels', function() {
    it('should create and return one parcel', function(done) {
      chai
        .request(server)
        .post('/api/v1/parcels')
        .send({
          user_id: 'Dean',
          street_address: '1234 Main St',
          recipient_name: 'test',
          recipient_first_name: 'test',
          recipient_last_name: 'test',
          organization_name: 'test',
          city: 'test',
          state_or_province: 'test',
          country: 'test',
          postal_code: 'test',
          barcode: '0e2887fc-19c9-4bf5-a9fc-0c5f5a23a87c',
          parcel_status: 'test',
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
```

Here when a client hits the `/api/v1/parcels` route with a POST request and supplies address information that is saved in the database as a new record. Notice how we are using `uuidv4()` to generate a unique code for each record. We return the uuid as the `res`, the idea being we will use this to generate the barcode in the front-end. We also use `new Date().toISOString()` to add a timestamp of when that record was created.

If you're wondering (like I did) why it seems like the POST request is updating and not inserting new values each time the test is run, it's because we added `{ force: 'last' }` to re-run the latest migration every time we restart our server. So even though it looks like the barcode and creation_date are changing in place, it's really:

1.  Dropping the parcels table
2.  Inserting the two sample rows in our 001-init.sql file
3.  POSTing the new row with the new data

To
