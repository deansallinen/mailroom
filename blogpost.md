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
app.get('/api/v1/parcels', function(req, res, next) {
  res.send('Get parcels');
});
```

to access our database using SQL queries. So how do we do that? Our `dbPromise` lives in App.js
