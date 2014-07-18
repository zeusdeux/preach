require=(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"Focm2+":[function(require,module,exports){
module.exports = require('./src/preach');

},{"./src/preach":5}],"Preach":[function(require,module,exports){
module.exports=require('Focm2+');
},{}],3:[function(require,module,exports){
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.

function EventEmitter() {
  this._events = this._events || {};
  this._maxListeners = this._maxListeners || undefined;
}
module.exports = EventEmitter;

// Backwards-compat with node 0.10.x
EventEmitter.EventEmitter = EventEmitter;

EventEmitter.prototype._events = undefined;
EventEmitter.prototype._maxListeners = undefined;

// By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.
EventEmitter.defaultMaxListeners = 10;

// Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.
EventEmitter.prototype.setMaxListeners = function(n) {
  if (!isNumber(n) || n < 0 || isNaN(n))
    throw TypeError('n must be a positive number');
  this._maxListeners = n;
  return this;
};

EventEmitter.prototype.emit = function(type) {
  var er, handler, len, args, i, listeners;

  if (!this._events)
    this._events = {};

  // If there is no 'error' event listener then throw.
  if (type === 'error') {
    if (!this._events.error ||
        (isObject(this._events.error) && !this._events.error.length)) {
      er = arguments[1];
      if (er instanceof Error) {
        throw er; // Unhandled 'error' event
      } else {
        throw TypeError('Uncaught, unspecified "error" event.');
      }
      return false;
    }
  }

  handler = this._events[type];

  if (isUndefined(handler))
    return false;

  if (isFunction(handler)) {
    switch (arguments.length) {
      // fast cases
      case 1:
        handler.call(this);
        break;
      case 2:
        handler.call(this, arguments[1]);
        break;
      case 3:
        handler.call(this, arguments[1], arguments[2]);
        break;
      // slower
      default:
        len = arguments.length;
        args = new Array(len - 1);
        for (i = 1; i < len; i++)
          args[i - 1] = arguments[i];
        handler.apply(this, args);
    }
  } else if (isObject(handler)) {
    len = arguments.length;
    args = new Array(len - 1);
    for (i = 1; i < len; i++)
      args[i - 1] = arguments[i];

    listeners = handler.slice();
    len = listeners.length;
    for (i = 0; i < len; i++)
      listeners[i].apply(this, args);
  }

  return true;
};

EventEmitter.prototype.addListener = function(type, listener) {
  var m;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events)
    this._events = {};

  // To avoid recursion in the case that type === "newListener"! Before
  // adding it to the listeners, first emit "newListener".
  if (this._events.newListener)
    this.emit('newListener', type,
              isFunction(listener.listener) ?
              listener.listener : listener);

  if (!this._events[type])
    // Optimize the case of one listener. Don't need the extra array object.
    this._events[type] = listener;
  else if (isObject(this._events[type]))
    // If we've already got an array, just append.
    this._events[type].push(listener);
  else
    // Adding the second element, need to change to array.
    this._events[type] = [this._events[type], listener];

  // Check for listener leak
  if (isObject(this._events[type]) && !this._events[type].warned) {
    var m;
    if (!isUndefined(this._maxListeners)) {
      m = this._maxListeners;
    } else {
      m = EventEmitter.defaultMaxListeners;
    }

    if (m && m > 0 && this._events[type].length > m) {
      this._events[type].warned = true;
      console.error('(node) warning: possible EventEmitter memory ' +
                    'leak detected. %d listeners added. ' +
                    'Use emitter.setMaxListeners() to increase limit.',
                    this._events[type].length);
      if (typeof console.trace === 'function') {
        // not supported in IE 10
        console.trace();
      }
    }
  }

  return this;
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.once = function(type, listener) {
  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  var fired = false;

  function g() {
    this.removeListener(type, g);

    if (!fired) {
      fired = true;
      listener.apply(this, arguments);
    }
  }

  g.listener = listener;
  this.on(type, g);

  return this;
};

// emits a 'removeListener' event iff the listener was removed
EventEmitter.prototype.removeListener = function(type, listener) {
  var list, position, length, i;

  if (!isFunction(listener))
    throw TypeError('listener must be a function');

  if (!this._events || !this._events[type])
    return this;

  list = this._events[type];
  length = list.length;
  position = -1;

  if (list === listener ||
      (isFunction(list.listener) && list.listener === listener)) {
    delete this._events[type];
    if (this._events.removeListener)
      this.emit('removeListener', type, listener);

  } else if (isObject(list)) {
    for (i = length; i-- > 0;) {
      if (list[i] === listener ||
          (list[i].listener && list[i].listener === listener)) {
        position = i;
        break;
      }
    }

    if (position < 0)
      return this;

    if (list.length === 1) {
      list.length = 0;
      delete this._events[type];
    } else {
      list.splice(position, 1);
    }

    if (this._events.removeListener)
      this.emit('removeListener', type, listener);
  }

  return this;
};

EventEmitter.prototype.removeAllListeners = function(type) {
  var key, listeners;

  if (!this._events)
    return this;

  // not listening for removeListener, no need to emit
  if (!this._events.removeListener) {
    if (arguments.length === 0)
      this._events = {};
    else if (this._events[type])
      delete this._events[type];
    return this;
  }

  // emit removeListener for all listeners on all events
  if (arguments.length === 0) {
    for (key in this._events) {
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }
    this.removeAllListeners('removeListener');
    this._events = {};
    return this;
  }

  listeners = this._events[type];

  if (isFunction(listeners)) {
    this.removeListener(type, listeners);
  } else {
    // LIFO order
    while (listeners.length)
      this.removeListener(type, listeners[listeners.length - 1]);
  }
  delete this._events[type];

  return this;
};

EventEmitter.prototype.listeners = function(type) {
  var ret;
  if (!this._events || !this._events[type])
    ret = [];
  else if (isFunction(this._events[type]))
    ret = [this._events[type]];
  else
    ret = this._events[type].slice();
  return ret;
};

EventEmitter.listenerCount = function(emitter, type) {
  var ret;
  if (!emitter._events || !emitter._events[type])
    ret = 0;
  else if (isFunction(emitter._events[type]))
    ret = 1;
  else
    ret = emitter._events[type].length;
  return ret;
};

function isFunction(arg) {
  return typeof arg === 'function';
}

function isNumber(arg) {
  return typeof arg === 'number';
}

function isObject(arg) {
  return typeof arg === 'object' && arg !== null;
}

function isUndefined(arg) {
  return arg === void 0;
}

},{}],4:[function(require,module,exports){
module.exports={
  "ECHNLNOTFOUND": "Preach: No channels match the given channel name or regular expression",
  "ELSTNRNOTFOUND": "Preach: Could not unsubscribe. Maybe the subsciber doesn't exist"
}

},{}],5:[function(require,module,exports){
var EventEmitter = require('events').EventEmitter;
var util         = require('./util');
var errors       = require('./errors');

var emitter      = new EventEmitter;
var Preach       = {};

//_q.channel     = { fnIndex: fn, ...}
Preach._q        = {};

//unlimited listeners per event
emitter.setMaxListeners(0);


Preach.pub = function(channel) {
  var channels = util.getChannels(channel, Preach._q);
  var data     = [].splice.call(arguments, 1);
  if (!channels.length || (channels.length === 1 && !(channels[0] in Preach._q))) throw new Error(errors.ECHNLNOTFOUND);
  for (var i in channels) {
    emitter.emit.apply(emitter, [channels[i]].concat(data));
  }
  return true;
};

Preach.sub = function(channel, fn) {
  var channels = util.getChannels(channel, Preach._q);
  var fnIndex  = util.getFnIdx(fn);
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
  var fnIndex  = util.getFnIdx(fn);
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

},{"./errors":4,"./util":6,"events":3}],6:[function(require,module,exports){
exports.getFnIdx = function(fn) {
  return fn.toString().replace(/[\s\r\n\f\t\v]/g, '');
};

exports.getChannels = function(expr, obj) {
  var channels = [];
  if (expr instanceof RegExp) {
    for (var k in obj) {
      if (obj.hasOwnProperty(k) && expr.test(k)) channels.push(k);
    }
  }
  else {
    //expr is the channel name itself
    channels = [expr];
  }
  return channels;
};

},{}]},{},[])