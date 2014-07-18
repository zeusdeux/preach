var EventEmitter = require('events').EventEmitter;
var util = require('./util');

var emitter = new EventEmitter;
var Preach = {};

Preach._q = {};

Preach.pub = function(channel, data) {
  var channels = util.getChannels(channel, Preach._q);
  if (!channels.length) throw new Error('Preach: No channels match the given regular expression');
  for (var i in channels) {
    emitter.emit(channels[i], data);
  }
  return true;
};

Preach.sub = function(channel, fn) {
  var channels = util.getChannels(channel, Preach._q);
  var fnIndex = util.getFnIdx(fn);
  var curr;
  if (!channels.length) throw new Error('Preach: No channels match the given regular expression');
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
  if (!channels.length) throw new Error('Preach: No channels match the given regular expression');
  for (var i in channels) {
    curr = channels[i];
    try {
      emitter.removeListener(curr, Preach._q[curr][fnIndex]);
    }
    catch (e) {
      throw new Error('Preach: Could not unsubscribe. Maybe the subsciber doesn\'t exist.', e);
    }
    delete Preach._q[curr][fnIndex];
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
  var result = {};
  for (var i in channels) {
    curr = channels[i];
    result[curr] = Preach._q[curr];
  }
  return result;
};

module.exports = Preach;
