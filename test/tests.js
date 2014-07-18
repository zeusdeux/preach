var Preach = require('../');
var sinon = require('sinon');
describe('Preach', function() {
  beforeEach(function() {
    Preach.subscribers().should.be.eql({});
  });
  afterEach(function() {
    Preach.purge();
    Preach.subscribers().should.be.eql({});
  });
  describe('#pub', function() {
    describe('when data is published to a channel', function() {
      it('should be received by all subscribers', function(done) {
        var x = 0;
        Preach.sub('test', function(d) {
          d.should.be.exactly(1234);
          x++;
        });
        Preach.sub('test', function(d) {
          d.should.be.exactly(1234);
          x++;
          x.should.be.exactly(2);
          done();
        });
        Preach.pub('test', 1234);
      });
    });
    describe('when you publish to channels using regex', function() {
      describe('when there are channels that match the regex', function() {
        it('should publish to all matching channels', function(done) {
          var x = 0;
          Preach.sub('test', function(d) {
            d.should.be.exactly(1234);
            x++;
          });
          Preach.sub('test2', function(d) {
            d.should.be.exactly(1234);
            x++;
            x.should.be.exactly(2);
            done();
          });
          Preach.pub(/te.*/, 1234);
        });
      });
      describe('when there are no channels that match the regex', function() {
        it('should throw', function() {
          Preach.pub.bind(Preach, /t.*/).should.throw();
        });
      });
    });
  });
  describe('#sub', function() {
    describe('when functions subscribe to a channel', function() {
      it('should invoke the subscibers with the data published to that channel', function(done) {
        var x = 0;
        Preach.sub('test', function(d) {
          d.should.be.exactly(1234);
          x++;
        });
        Preach.sub('test', function(d) {
          d.should.be.exactly(1234);
          x++;
          x.should.be.exactly(2);
          done();
        });
        Preach.pub('test', 1234);
      });
      it('should not invoke the subscribers when data is published some channel that they aren\'t subscribed to', function(done) {
        var x = 0;
        Preach.sub('test', function(d) {
          x++;
        });
        Preach.sub('test', function(d) {
          while (false); //no-op
          x++;
        });
        Preach.sub('test2', function(d) {
          d.should.be.exactly(4000);
          x++;
          x.should.be.exactly(1);
          done();
        });
        Preach.pub('test2', 4000);
      });
    });
    describe('when functions subscribe using regex for channel', function() {
      describe('when there are channels that match the regex', function() {
        it('should make the function subscribe to all matching channels', function() {
          var spy = sinon.spy();
          Preach.sub('test', function() {
            return;
          });
          Preach.sub('tootsie', function() {
            return;
          });
          Preach.sub(/t.*/, spy);
          Preach.pub('test');
          Preach.pub('tootsie');
          spy.calledTwice.should.be.true;
        });
      });
      describe('when there are no channels that match the regex', function() {
        it('should throw', function() {
          var spy = function() {};
          Preach.sub.bind(Preach, /t.*/, spy).should.throw();
        });
      });
    });
  });
  describe('#unsub', function() {
    describe('when an existing subscriber unsubscribes', function() {
      it('should not recieve any more notifications', function(done) {
        Preach.sub('test', function(d) {
          console.log(d);
        });
        Preach.sub('test', function(d) {
          while (false); //no-op
          Object.keys(Preach.subscribers('test').test).length.should.be.exactly(1);
          done();
        });
        Preach.unsub('test', function(d) {
          console.log(d);
        }).should.be.eql(true);
        Preach.pub('test');
      });
    });
    describe('when a non-existant subscriber unsubscribes', function() {
      it('should error out', function() {
        Preach.sub('test', function(d) {
          console.log(d);
        });
        Preach.unsub.bind(Preach, 'test', function() {}).should.throw();
      });
    });
    describe('when functions unsubscribe using regex for channel', function() {
      describe('when there are channels that match the regex', function() {
        it('should unsubscribe the subscriber from all matching channels', function(done) {
          var spy = sinon.spy();
          Preach.sub('test', spy);
          Preach.sub('tootsie', spy);
          Preach.sub('test', function() {
            spy.callCount.should.be.exactly(0);
            done();
          });
          Preach.unsub(/t.*/, spy);
          Preach.pub('test', 'hiya');
        });
      });
      describe('when there are no channels that match the regex', function() {
        it('should throw', function() {
          var spy = function() {};
          Preach.unsub.bind(Preach, /t.*/, spy).should.throw();
        });
      });
    });
  });
  describe('#channels', function() {

  });
  describe('#subscribers', function() {

  });
  describe('#purge', function() {

  });
});
