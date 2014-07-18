var EventEmitter = require('events').EventEmitter;
var util = require('./util');
var errors = require('./errors');

var emitter = new EventEmitter;
var Preach = {};

//unlimited listeners per event
emitter.setMaxListeners(0);

//_q.channel = { fnIndex: fn, ...}
Preach._q = {};

Preach.pub = function(channel) {
  var channels = util.getChannels(channel, Preach._q);
  var data = [].splice.call(arguments, 1);
  if (!channels.length || (channels.length === 1 && !(channels[0] in Preach._q))) throw new Error(errors.ECHNLNOTFOUND);
  for (var i in channels) {
    emitter.emit.apply(emitter, [channels[i]].concat(data));
  }
  return true;
};

Preach.sub = function(channel, fn) {
  var channels = util.getChannels(channel, Preach._q);
  var fnIndex = util.getFnIdx(fn);
  var curr;
  if (!channels.length) throw new Error(errors.ECHNLNOTFOUND);
  for (var i in channels) {
    curr = channels[i];
    Preach._q[curr] = Preach._q[curr] || {};
    Preach._q[curr][fnIndex] = fn;
    emitter.on(curr, Preach._q[curr][fnIndex]);
  }
  return true;
};

Preach.unsub = function(channel, fn) {
  var channels = util.getChannels(channel, Preach._q);
  var fnIndex = util.getFnIdx(fn);
  var curr;
  if (!channels.length || (channels.length === 1 && !(channels[0] in Preach._q))) throw new Error(errors.ECHNLNOTFOUND);
  for (var i in channels) {
    try {
      curr = channels[i];
      emitter.removeListener(curr, Preach._q[curr][fnIndex]);
      delete Preach._q[curr][fnIndex];
    }
    catch (e) {
      throw new Error(errors.ELSTNRNOTFOUND, e);
    }
  }
  return true;
};

Preach.purge = function() {
  var channels = util.getChannels(/.*/, Preach._q);
  var curr;
  for (var i in channels) {
    curr = channels[i];
    emitter.removeAllListeners(curr);
    delete Preach._q[curr];
  }
  return true;
};

Preach.channels = function() {
  return util.getChannels(/.*/, Preach._q);
};

Preach.subscribers = function(channel) {
  var channels = util.getChannels(channel || /.*/, Preach._q);
  var curr;
  var result;
  result = {};
  if (channels.length === 1 && !(channels[0] in Preach._q)) return result;
  for (var i in channels) {
    curr = channels[i];
    result[curr] = [];
    for (var k in Preach._q[curr]) {
      if (Preach._q[curr].hasOwnProperty(k)) {
        result[curr].push(Preach._q[curr][k]);
      }
    }
  }
  return result;
};

Preach.subscriberCount = function(channel) {
  var channels = util.getChannels(channel || /.*/, Preach._q);
  var curr;
  var result;
  result = {};
  if (channels.length === 1 && !(channels[0] in Preach._q)) return result;
  for (var i in channels) {
    curr = channels[i];
    result[curr] = EventEmitter.listenerCount(emitter, curr);
  }
  return result;
};

Preach.setMaxSubscribers = function(n) {
  emitter.setMaxListeners(n);
};

module.exports = Preach;
