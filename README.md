preach
======
[![Build Status](https://travis-ci.org/zeusdeux/preach.svg?branch=master)](https://travis-ci.org/zeusdeux/preach)

Preach is a lightweight pubsub utility for node and the browser.   
The browser version is ~2kb gzipped.

## Installation

### For `node`

```javascript
npm install preach --save
```

### For browsers

```
bower install preach
```

or

```
git clone git@github.com:zeusdeux/preach.git
```

If you plan to use it with [browserify](http://browserify.org/), then just `require` `index.js`.   
If you plan to use it directly in the browser, then include `browser/preach.min.js`. This will export
a global `require` function.   
You can then do:

```html
<script>
  var Preach = require('Preach');
  var preachInstance = new Preach;
</script>
```

## Changelog

- 0.2.0
  - `Preach` now exports a constructor when `require`-ed instead of a monolithic instance (incompatible change)
- 0.1.0
  - Initial version

## API

- [Preach.prototype.pub( channel, [data], [data], [...] )](#preachprototypepubchannel-data-data-)
- [Preach.prototype.sub( channel, subscriber )](#preachprototypesubchannel-subscriber)
- [Preach.prototype.unsub( channel, subscriber )](#preachprototypeunsubchannel-subscriber)
- [Preach.prototype.purge()](#preachprototypepurge)
- [Preach.prototype.channels()](#preachprototypechannels)
- [Preach.prototype.subscribers( channel )](#preachprototypesubscriberschannel)
- [Preach.prototype.subscriberCount( channel )](#preachprototypesubscribercountchannel)
- [Preach.prototype.setMaxSubscribers( n )](#preachprototypesetmaxsubscribersn)

## Preach.prototype.pub(channel, [data], [data], [...])

This method is used to publish `data` to `channel`.

This method takes the following parameters:

- `channel`: `String` channel name or a regular expression (`RegExp`)
- `data`   : Any valid javascript value. Also, this is an optional parameter

Example:

```javascript
var preach = new Preach;
preach.pub('channel1');
preach.pub('channel2', 1234);
preach.pub('channel3', {a: 100}, 'test');
preach.pub(/^channel.*/, null, {a: 'boop'}); //will publish data to all channels beginning with 'channel'
```

> ####Note:
> If a RegExp or String is passed as `channel` and there are no channels that match it, then `Preach` will `throw`.

## Preach.prototype.sub(channel, subscriber)

This method is used to add a `subscriber` to `channel`.

This method takes the following parameters:

- `channel`     : `String` channel name or a regular expression (`RegExp`)
- `subscriber`  : A valid `Function`. This `Function` is called whenever data is published to the `channel`.
A `subscriber` can subscribe to as many channels as required and even publish to any channel.

> ####Note:
> If a `subscriber` publishes to a channel that it is subscribed to, then that will result in infinite recursion.

Example:

```javascript
var preach = new Preach;
preach.sub('channel1', console.log.bind(window.console)); //true
preach.sub(/^channel.*/, function(){
  console.log('I will get subscribed to any existing channel that has a name starting with the string "channel"');
}); //true
```

> ####Note:
> If a RegExp is passed as `channel` and there are no channels that match it, then `Preach` will `throw`.
> If a String is passed as `channel` and there are no channels that match it, then a new `channel` will be created and `subscriber` will be subscribed to it.

## Preach.prototype.unsub(channel, subscriber)

This method is used to unsubscribe a `subscriber` from `channel`.

This method takes the following parameters:

- `channel`     : `String` channel name or a regular expression (`RegExp`)
- `subscriber`  : A valid `Function`. This `Function` is removed as a `subscriber` of `channel`

Example:

```javascript
var preach = new Preach;
preach.sub('channel1', console.log.bind(window.log)); //true
preach.unsub('channel1', console.log.bind(window.log)); //true

preach.sub('test1', function(){}); //true
preach.sub('test2', function(){}); //true
preach.unsub(/.*/, function(){}); //true
                                  //function(){} is now unsubscribed from *all* channels
```

> ####Note:
> If a RegExp or String is passed as `channel` and there are no channels that match it, then `Preach` will `throw`.

## Preach.prototype.purge()

This method purges all channels and their subscribers and gives you a fresh `Preach` instance to work with.
This method is quite destructive and hence caution is advised in its usage.

Example:

```javascript
var preach = new Preach;
preach.sub('test1', function(){});
preach.sub('test2', function(){});
preach.channels(); //["test1", "test2"]
preach.subscribers(); //Object {test1: Array[1], test2: Array[1]}
preach.purge(); //PURGE! return val -> true
preach.channels(); //[]
preach.subscribers(); //{}
```

## Preach.prototype.channels()

This method returns an array of the current active channels.

```javascript
var preach = new Preach;
preach.sub('test1', function(){}); //true
preach.sub('test2', function(){}); //true
preach.channels(); //["test1", "test2"]
```

## Preach.prototype.subscribers(channel)

This method returns information about the subscribers for a `channel`.

This method takes the following parameter:

- `channel` : `String` channel name or a regular expression (`RegExp`)
Not providing a value for `channel` is the same as passing `/.*/` i.e., basically "GET ALL THE CHANNELS AND THEIR SUBSCRIBERS!".

Example:

```javascript
var preach = new Preach;
preach.sub('test1', function(){});
preach.sub('test2', function(){});
preach.subscribers(); //Object {test1: Array[1], test2: Array[1]}
preach.subscribers('test1'); //Object {test1: Array[1]}
```

> ####Note:
> If a RegExp or String is passed as `channel` and there are no channels that match it, then `Preach.subscribers` returns an empty object ie `{}`
and *does not* `throw`.

## Preach.prototype.subscriberCount(channel)

This method returns the no of subscribers a channel has.

This method takes the following parameter:

- `channel` : `String` channel name or a regular expression (`RegExp`)
Not providing a value for `channel` is the same as passing `/.*/` i.e., basically "GET THE SUBSCRIBER COUNT FOR ALL THE CHANNELS".

Example:

```javascript
var preach = new Preach;
preach.sub('test1', function(){});
preach.sub('test1', function(d){ console.log(d); });
preach.sub('test2', function(){});
preach.subscriberCount(); //Object {test1: 2, test2: 1}
preach.subscriberCount('test2'); //Object {test2: 1}
preach.subscriberCount(/1$/); //Object {test1: 2}
```

> ####Note:
> If a RegExp or String is passed as `channel` and there are no channels that match it, then `Preach.subscriberCount` returns an empty object ie `{}`
and *does not* `throw`.


## Preach.prototype.setMaxSubscribers(n)

This sets the max listeners for each channel at `n`. Default is unlimited which is set by making `n` `zero`.   
This can also be set during `Preach` initialization.

```javascript
var preach = new Preach;
preach.setMaxSubscribers(10);
//analogous to
var preach = new Preach(10);
```

> ####Note:
> If `n` is lesser than `zero` then `Preach` will `throw`.

