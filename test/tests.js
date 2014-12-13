var Preach = require('../');
var preach = new Preach;
var sinon  = require('sinon');
var errors = require('../src/errors');

describe('Preach', function() {
  beforeEach(function() {
    preach.subscribers().should.be.empty;
  });
  afterEach(function() {
    preach.purge();
    preach.subscribers().should.be.empty;
  });
  describe('#pub', function() {
    describe('when data is published to a channel', function() {
      it('should be received by all subscribers', function(done) {
        var x = 0;
        preach.sub('test', function(d) {
          d.should.be.exactly(1234);
          x++;
        });
        preach.sub('test', function(d) {
          d.should.be.exactly(1234);
          x++;
          x.should.be.exactly(2);
          done();
        });
        preach.pub('test', 1234);
      });
    });
    describe('when more than one item is published to a channel', function() {
      it('should all be received by the subscriber', function(done) {
        preach.sub('test', function(a, b, c) {
          arguments.length.should.be.exactly(3);
          a.should.be.exactly(1);
          b.should.be.exactly(2);
          c.should.be.exactly('OMG');
          done();
        });
        preach.pub('test', 1, 2, 'OMG');
      });
    });
    describe('when you publish to a non-existant channel (using a string name)', function() {
      it('should not throw', function() {
        preach.pub.bind(preach, '23424').should.not.throw();
      });
    });
    describe('when you publish to channels using regex', function() {
      describe('when there are channels that match the regex', function() {
        it('should publish to all matching channels', function(done) {
          var x = 0;
          preach.sub('test', function(d) {
            d.should.be.exactly(1234);
            x++;
          });
          preach.sub('test2', function(d) {
            d.should.be.exactly(1234);
            x++;
            x.should.be.exactly(2);
            done();
          });
          preach.pub(/te.*/, 1234);
        });
      });
      describe('when there are no channels that match the regex', function() {
        it('should not throw', function() {
          preach.pub.bind(preach, /t.*/).should.not.throw();
        });
      });
    });
  });
  describe('#sub', function() {
    describe('when functions subscribe to a channel', function() {
      it('should invoke the subscibers with the data published to that channel', function(done) {
        var x = 0;
        preach.sub('test', function(d) {
          d.should.be.exactly(1234);
          x++;
        });
        preach.sub('test', function(d) {
          d.should.be.exactly(1234);
          x++;
          x.should.be.exactly(2);
          done();
        });
        preach.pub('test', 1234);
      });
      it('should not invoke the subscribers when data is published some channel that they aren\'t subscribed to', function(done) {
        var x = 0;
        preach.sub('test', function(d) {
          x++;
        });
        preach.sub('test', function(d) {
          while (false); //no-op
          x++;
        });
        preach.sub('test2', function(d) {
          d.should.be.exactly(4000);
          x++;
          x.should.be.exactly(1);
          done();
        });
        preach.pub('test2', 4000);
      });
    });
    describe('when functions subscribe using regex for channel', function() {
      describe('when there are channels that match the regex', function() {
        it('should make the function subscribe to all matching channels', function() {
          var spy = sinon.spy();
          preach.sub('test', function() {
            return;
          });
          preach.sub('tootsie', function() {
            return;
          });
          preach.sub(/t.*/, spy);
          preach.pub('test');
          preach.pub('tootsie');
          spy.calledTwice.should.be.true;
        });
      });
      describe('when there are no channels that match the regex', function() {
        it('should not throw', function() {
          var spy = function() {};
          preach.sub.bind(preach, /t.*/, spy).should.not.throw();
        });
      });
    });
  });
  describe('#unsub', function() {
    describe('when an existing subscriber unsubscribes', function() {
      it('should not recieve any more notifications', function(done) {
        preach.sub('test', function(d) {
          console.log(d);
        });
        preach.sub('test', function(d) {
          while (false); //no-op
          Object.keys(preach.subscribers('test').test).length.should.be.exactly(1);
          done();
        });
        preach.unsub('test', function(d) {
          console.log(d);
        }).should.be.eql(true);
        preach.pub('test');
      });
    });
    describe('when a non-existant subscriber unsubscribes', function() {
      it('should error out', function() {
        preach.sub('test', function(d) {
          console.log(d);
        });
        preach.unsub.bind(preach, 'test', function() {}).should.not.throw(errors.ELSTNRNOTFOUND);
      });
    });
    describe('when you try to unsubscribe from a non-existant channel using a string channel name', function() {
      it('should throw', function() {
        preach.unsub.bind(preach, 'adad', function() {}).should.not.throw(errors.ECHNLNOTFOUND);
      });
    });
    describe('when functions unsubscribe using regex for channel', function() {
      describe('when there are channels that match the regex', function() {
        it('should unsubscribe the subscriber from all matching channels', function(done) {
          var spy = sinon.spy();
          preach.sub('test', spy);
          preach.sub('tootsie', spy);
          preach.sub('test', function() {
            spy.callCount.should.be.exactly(0);
            done();
          });
          preach.unsub(/t.*/, spy);
          preach.pub('test', 'hiya');
        });
      });
      describe('when there are no channels that match the regex', function() {
        it('should not throw', function() {
          var spy = function() {};
          preach.unsub.bind(preach, /t.*/, spy).should.not.throw();
        });
      });
    });
  });
  describe('#purge', function() {
    it('should remove all channels and all listeners', function() {
      var spy = sinon.spy();
      preach.sub('test', spy);
      preach.sub('test2', spy);
      preach.purge();
      preach.pub.bind(preach, 'test', 1234).should.not.throw();
      preach.pub.bind(preach, /.*/, 1234).should.not.throw();
      spy.callCount.should.be.exactly(0);
    });
  });
  describe('#channels', function() {
    it('should return an array of channel names', function() {
      preach.sub('test1', function() {});
      preach.sub('test2', function() {});
      preach.sub('test3', function() {});
      preach.sub('test4', function() {});
      preach.channels().should.be.an.instanceof.Array;
      preach.channels().length.should.be.exactly(4);
      preach.channels().filter(function(v, i) {
        return 'test' + (i + 1) === v;
      }).length.should.be.exactly(4, 'After filter, array has shrunk');
    });
  });
  describe('#subscribers', function() {
    describe('when called with no arguments', function() {
      it('should return an object of all channels with an array containing their subscribers', function() {
        var spy = sinon.spy();
        var x = function() {};
        preach.sub('test', spy);
        preach.sub('test2', spy);
        preach.sub('test2', x);
        preach.subscribers().should.have.ownProperty('test');
        preach.subscribers().should.have.ownProperty('test2');
        preach.subscribers().test.should.have.enumerable(0, spy);
        preach.subscribers().test2.should.have.enumerable(0, spy);
        preach.subscribers().test2.should.have.enumerable(1, x);
      });
    });
    describe('when called with string channel name', function() {
      describe('when channel is valid', function() {
        it('should return an object of the channel name with an array of its listeners', function() {
          var spy = sinon.spy();
          preach.sub('test', spy);
          preach.subscribers('test').should.have.ownProperty('test', spy);
          Object.keys(preach.subscribers('test')).length.should.be.exactly(1);
        });
      });
      describe('when channel is invalid', function() {
        it('should return an empty object', function() {
          preach.subscribers('test').should.be.empty;
        });
      });
    });
    describe('when called with regex', function() {
      describe('when regex matches', function() {
        it('should return an object of the all the matched channels with array of their listeners', function() {
          var spy = sinon.spy();
          preach.sub('test', spy);
          preach.subscribers(/t.*/).should.have.ownProperty('test', spy);
          Object.keys(preach.subscribers(/.*/)).length.should.be.exactly(1);
        });
      });
      describe('when regex doesn\'t match', function() {
        it('should return an empty object', function() {
          preach.subscribers(/t.*/).should.be.empty;
        });
      });
    });
  });
  describe('#subscriberCount', function() {
    describe('when called with no arguments', function() {
      it('should return an object of all channels with the no of subscribers they each have', function() {
        var spy = sinon.spy();
        var x = function() {};
        preach.sub('test', spy);
        preach.sub('test2', spy);
        preach.sub('test2', x);
        preach.subscriberCount().should.have.ownProperty('test', 1);
        preach.subscriberCount().should.have.ownProperty('test2', 2);
      });
    });
    describe('when called with string channel name', function() {
      describe('when channel is valid', function() {
        it('should return an object of the channel name with an array of its listeners', function() {
          var spy = sinon.spy();
          preach.sub('test', spy);
          preach.subscriberCount('test').should.have.ownProperty('test', 1);
        });
      });
      describe('when channel is invalid', function() {
        it('should return an empty object', function() {
          preach.subscriberCount('test').should.be.empty;
        });
      });
    });
    describe('when called with regex', function() {
      describe('when regex matches', function() {
        it('should return an object of the all the matched channels with array of their listeners', function() {
          var spy = sinon.spy();
          preach.sub('test', spy);
          preach.subscriberCount(/t.*/).should.have.ownProperty('test', 1);
        });
      });
      describe('when regex doesn\'t match', function() {
        it('should return an empty object', function() {
          preach.subscriberCount(/t.*/).should.be.empty;
        });
      });
    });
  });
  describe('#setMaxSubscribers', function() {
    describe('when n is less than 0', function() {
      it('should throw', function() {
        preach.setMaxSubscribers.bind(preach, -1).should.throw();
      });
    });
  });
  describe('when there are multiple instances of Preach',function(){
    describe('when each instance has a channel with the same name',function(){
      describe('when data is published to that channel on one instance',function(){
        it('should only be picked up by the subscribers for that channel on that instance',function(){
          var p1 = new Preach;
          var p2 = new Preach;
          var spy1 = sinon.spy();
          var spy2 = sinon.spy();
          var spy3 = sinon.spy();
          p1.sub('test', spy1);
          p1.sub('test', spy2);
          p2.sub('test', spy3);
          p1.pub(/t.*/, 1234);
          spy1.calledOnce.should.be.true;
          spy2.calledOnce.should.be.true;
          spy3.callCount.should.be.exactly(0);
          p2.pub('test', 'boop');
          spy3.calledOnce.should.be.true;
        });
      });
    });
  });
});
