const chai = require('chai');
const should = chai.should();
const chaiHTTP = require('chai-http');
const server = require('../app');

chai.use(chaiHTTP);

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
