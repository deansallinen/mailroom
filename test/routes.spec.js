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

  describe('POST /api/v1/parcels', function() {
    it('should create one parcel', function(done) {
      chai
        .request(server)
        .post('/api/v1/parcels')
        .send({
          user_id: 'Someone Else',
          street_address: '1234 Main St',
          attn_name: 'test',
          attn_organization: 'test',
          city: 'test',
          state_or_province: 'test',
          country: 'test',
          postal_code: 'test',
          shipment_status: 'test'
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
