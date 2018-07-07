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

  describe('POST /api/v1/parcels', function() {
    it('should create and return one parcel', function(done) {
      chai
        .request(server)
        .post('/api/v1/parcels')
        .send({
          user_id: 'Someone Else',
          street_address: '1234 Main St',
          recipient_name: 'test',
          recipient_first_name: 'test',
          recipient_last_name: 'test',
          organization_name: 'test',
          city: 'test',
          state_or_province: 'test',
          country: 'test',
          postal_code: 'test',
          //   barcode: 'test',
          post_tracking_number: 'test',
          parcel_weight: '1',
          parcel_length: '1',
          parcel_width: '1',
          parcel_height: '1',
          shipping_method: 'test',
          parcel_status: 'test',
          creation_date: 'test',
          received_date: 'test'
        })
        .end(function(err, res) {
          res.should.have.status(200);
          //   res.should.be.a('string');
          done();
          //   res.should.be.json;
          //   res.body.should.be.a('object');
          //   res.body.should.have.property('user_id');
          //   res.body.user_id.should.equal('Dean');
          //   res.body.should.have.property('street_address');
          //   res.body.street_address.should.equal('1234 Main St');
        });
    });
  });
});
