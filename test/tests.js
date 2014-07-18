var Preach = require('../');
var sinon = require('sinon');
var errors = require('../src/errors');
describe('Preach', function() {
  beforeEach(function() {
    Preach.subscribers().should.be.empty;
  });
  afterEach(function() {
    Preach.purge();
    Preach.subscribers().should.be.empty;
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
    describe('when more than one item is published to a channel', function() {
      it('should all be received by the subscriber', function(done) {
        Preach.sub('test', function(a, b, c) {
          arguments.length.should.be.exactly(3);
          a.should.be.exactly(1);
          b.should.be.exactly(2);
          c.should.be.exactly('OMG');
          done();
        });
        Preach.pub('test', 1, 2, 'OMG');
      });
    });
    describe('when you publish to a non-existant channel (using a string name)', function() {
      it('should throw', function() {
        Preach.pub.bind(Preach, '23424').should.throw();
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
        Preach.unsub.bind(Preach, 'test', function() {}).should.throw(errors.ELSTNRNOTFOUND);
      });
    });
    describe('when you try to unsubscribe from a non-existant channel using a string channel name', function() {
      it('should throw', function() {
        Preach.unsub.bind(Preach, 'adad', function() {}).should.throw(errors.ECHNLNOTFOUND);
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
  describe('#purge', function() {
    it('should remove all channels and all listeners', function() {
      var spy = sinon.spy();
      Preach.sub('test', spy);
      Preach.sub('test2', spy);
      Preach.purge();
      Preach.pub.bind(Preach, 'test', 1234).should.throw();
      Preach.pub.bind(Preach, /.*/, 1234).should.throw();
      spy.callCount.should.be.exactly(0);
    });
  });
  describe('#channels', function() {
    it('should return an array of channel names', function() {
      Preach.sub('test1', function() {});
      Preach.sub('test2', function() {});
      Preach.sub('test3', function() {});
      Preach.sub('test4', function() {});
      Preach.channels().should.be.an.instanceof.Array;
      Preach.channels().length.should.be.exactly(4);
      Preach.channels().filter(function(v, i) {
        return 'test' + (i + 1) === v;
      }).length.should.be.exactly(4, 'After filter, array has shrunk');
    });
  });
  describe('#subscribers', function() {
    describe('when called with no arguments', function() {
      it('should return an object of all channels with an array containing their subscribers', function() {
        var spy = sinon.spy();
        var x = function() {};
        Preach.sub('test', spy);
        Preach.sub('test2', spy);
        Preach.sub('test2', x);
        Preach.subscribers().should.have.ownProperty('test');
        Preach.subscribers().should.have.ownProperty('test2');
        Preach.subscribers().test.should.have.enumerable(0, spy);
        Preach.subscribers().test2.should.have.enumerable(0, spy);
        Preach.subscribers().test2.should.have.enumerable(1, x);
      });
    });
    describe('when called with string channel name', function() {
      describe('when channel is valid', function() {
        it('should return an object of the channel name with an array of its listeners', function() {
          var spy = sinon.spy();
          Preach.sub('test', spy);
          Preach.subscribers('test').should.have.ownProperty('test', spy);
          Object.keys(Preach.subscribers('test')).length.should.be.exactly(1);
        });
      });
      describe('when channel is invalid', function() {
        it('should return an empty object', function() {
          Preach.subscribers('test').should.be.empty;
        });
      });
    });
    describe('when called with regex', function() {
      describe('when regex matches', function() {
        it('should return an object of the all the matched channels with array of their listeners', function() {
          var spy = sinon.spy();
          Preach.sub('test', spy);
          Preach.subscribers(/t.*/).should.have.ownProperty('test', spy);
          Object.keys(Preach.subscribers(/.*/)).length.should.be.exactly(1);
        });
      });
      describe('when regex doesn\'t match', function() {
        it('should return an empty object', function() {
          Preach.subscribers(/t.*/).should.be.empty;
        });
      });
    });
  });
  describe('#subscriberCount', function() {
    describe('when called with no arguments', function() {
      it('should return an object of all channels with the no of subscribers they each have', function() {
        var spy = sinon.spy();
        var x = function() {};
        Preach.sub('test', spy);
        Preach.sub('test2', spy);
        Preach.sub('test2', x);
        Preach.subscriberCount().should.have.ownProperty('test', 1);
        Preach.subscriberCount().should.have.ownProperty('test2', 2);
      });
    });
    describe('when called with string channel name', function() {
      describe('when channel is valid', function() {
        it('should return an object of the channel name with an array of its listeners', function() {
          var spy = sinon.spy();
          Preach.sub('test', spy);
          Preach.subscriberCount('test').should.have.ownProperty('test', 1);
        });
      });
      describe('when channel is invalid', function() {
        it('should return an empty object', function() {
          Preach.subscriberCount('test').should.be.empty;
        });
      });
    });
    describe('when called with regex', function() {
      describe('when regex matches', function() {
        it('should return an object of the all the matched channels with array of their listeners', function() {
          var spy = sinon.spy();
          Preach.sub('test', spy);
          Preach.subscriberCount(/t.*/).should.have.ownProperty('test', 1);
        });
      });
      describe('when regex doesn\'t match', function() {
        it('should return an empty object', function() {
          Preach.subscriberCount(/t.*/).should.be.empty;
        });
      });
    });
  });
});
