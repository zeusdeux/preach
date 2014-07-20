var EventEmitter = require('events').EventEmitter;
var util         = require('./util');
var errors       = require('./errors');

function Preach(n) {
  //fix a faulty call to the constructor
  if (!(this instanceof Preach)) return new Preach;

  //_q.channel     = { fnIndex: fn, ...}
  this._q = {};
  this._e = new EventEmitter;

  //unlimited listeners per event
  this._e.setMaxListeners(n || 0);
}

Preach.prototype.pub = function(channel) {
  var channels = util.getChannels(channel, this._q);
  var data     = [].splice.call(arguments, 1);
  if (!channels.length) throw new Error(errors.ECHNLNOTFOUND);
  for (var i in channels) {
    this._e.emit.apply(this._e, [channels[i]].concat(data));
  }
  return true;
};

Preach.prototype.sub = function(channel, fn) {
  var channels = channel instanceof RegExp ? util.getChannels(channel, this._q) : [channel];
  var fnIndex  = util.getFnIdx(fn);
  var curr;
  if (!channels.length) throw new Error(errors.ECHNLNOTFOUND);
  for (var i in channels) {
    curr = channels[i];
    this._q[curr] = this._q[curr] || {};
    this._q[curr][fnIndex] = fn;
    this._e.on(curr, this._q[curr][fnIndex]);
  }
  return true;
};

Preach.prototype.unsub = function(channel, fn) {
  var channels = util.getChannels(channel, this._q);
  var fnIndex  = util.getFnIdx(fn);
  var curr;
  if (!channels.length) throw new Error(errors.ECHNLNOTFOUND);
  for (var i in channels) {
    try {
      curr = channels[i];
      this._e.removeListener(curr, this._q[curr][fnIndex]);
      delete this._q[curr][fnIndex];
    }
    catch (e) {
      throw new Error(errors.ELSTNRNOTFOUND, e);
    }
  }
  return true;
};

Preach.prototype.purge = function() {
  var channels = util.getChannels(/.*/, this._q);
  var curr;
  for (var i in channels) {
    curr = channels[i];
    this._e.removeAllListeners(curr);
    delete this._q[curr];
  }
  return true;
};

Preach.prototype.channels = function() {
  return util.getChannels(/.*/, this._q);
};

Preach.prototype.subscribers = function(channel) {
  var channels = util.getChannels(channel || /.*/, this._q);
  var curr;
  var result;
  result = {};
  if (channels.length === 1 && !(channels[0] in this._q)) return result;
  for (var i in channels) {
    curr = channels[i];
    result[curr] = [];
    for (var k in this._q[curr]) {
      if (this._q[curr].hasOwnProperty(k)) {
        result[curr].push(this._q[curr][k]);
      }
    }
  }
  return result;
};

Preach.prototype.subscriberCount = function(channel) {
  var channels = util.getChannels(channel || /.*/, this._q);
  var curr;
  var result;
  result = {};
  if (channels.length === 1 && !(channels[0] in this._q)) return result;
  for (var i in channels) {
    curr = channels[i];
    result[curr] = EventEmitter.listenerCount(this._e, curr);
  }
  return result;
};

Preach.prototype.setMaxSubscribers = function(n) {
  this._e.setMaxListeners(n);
};

module.exports = Preach;
