preach
======
[![Build Status](https://travis-ci.org/zeusdeux/preach.svg?branch=master)](https://travis-ci.org/zeusdeux/preach)

Preach is a lightweight pubsub utility for node and the browser.

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
</script>
```

## API

- [Preach.pub(channel, [data], [data], [...])](#preachpubchannel-data-data-)
- [Preach.sub(channel, subscriber)](#preachsubchannel-subscriber)
- [Preach.unsub(channel, subscriber)](#preachunsubchannel-subscriber)
- [Preach.purge()](#preachpurge)
- [Preach.channels()](#preachchannels)
- [Preach.subscribers(channel)](#preachsubscriberschannel)
- [Preach.subscriberCount(channel)](#preachsubscribercountchannel)
- [Preach.setMaxSubscribers(n)](#preachsetmaxsubscribersn)

## Preach.pub(channel, [data], [data], [...])

This method is used to publish `data` to `channel`.

This method takes the following parameters:

- `channel`: `String` channel name or a regular expression (`RegExp`)
- `data`   : Any valid javascript value. Also, this is an optional parameter

Example:

```javascript
Preach.pub('channel1');
Preach.pub('channel2', 1234);
Preach.pub('channel3', {a: 100}, 'test');
Preach.pub(/^channel.*/, null, {a: 'boop'}); //will publish data to all channels beginning with 'channel'
```

> ####Note:
> If a RegExp or String is passed as `channel` and there are no channels that match it, then `Preach` will `throw`.

## Preach.sub(channel, subscriber)

This method is used to add a `subscriber` to `channel`.

This method takes the following parameters:

- `channel`     : `String` channel name or a regular expression (`RegExp`)
- `subscriber`  : A valid `Function`. This `Function` is called whenever data is published to the `channel`.
A `subscriber` can subscribe to as many channels as required and even publish to any channel.

> ####Note:
> If a `subscriber` publishes to a channel that it is subscribed to, then that will result in infinite recursion.

Example:

```javascript
Preach.sub('channel1', console.log.bind(window.console)); //true
Preach.sub(/^channel.*/, function(){
  console.log('I will get subscribed to any existing channel that has a name starting with the string "channel"');
}); //true
```

> ####Note:
> If a RegExp is passed as `channel` and there are no channels that match it, then `Preach` will `throw`.
> If a String is passed as `channel` and there are no channels that match it, then a new `channel` will be created and `subscriber` will be subscribed to it.

## Preach.unsub(channel, subscriber)

This method is used to unsubscribe a `subscriber` from `channel`.

This method takes the following parameters:

- `channel`     : `String` channel name or a regular expression (`RegExp`)
- `subscriber`  : A valid `Function`. This `Function` is removed as a `subscriber` of `channel`

Example:

```javascript
Preach.sub('channel1', console.log.bind(window.log)); //true
Preach.unsub('channel1', console.log.bind(window.log)); //true

Preach.sub('test1', function(){}); //true
Preach.sub('test2', function(){}); //true
Preach.unsub(/.*/, function(){}); //true
                                  //function(){} is now unsubscribed from *all* channels
```

> ####Note:
> If a RegExp or String is passed as `channel` and there are no channels that match it, then `Preach` will `throw`.

## Preach.purge()

This method purges all channels and their subscribers and gives you a fresh `Preach` instance to work with.
This method is quite destructive and hence caution is advised in its usage.

Example:

```javascript
Preach.sub('test1', function(){});
Preach.sub('test2', function(){});
Preach.channels(); //["test1", "test2"]
Preach.subscribers(); //Object {test1: Array[1], test2: Array[1]}
Preach.purge(); //PURGE! return val -> true
Preach.channels(); //[]
Preach.subscribers(); //{}
```

## Preach.channels()

This method returns an array of the current active channels.

```javascript
Preach.sub('test1', function(){}); //true
Preach.sub('test2', function(){}); //true
Preach.channels(); //["test1", "test2"]
```

## Preach.subscribers(channel)

This method returns information about the subscribers for a `channel`.

This method takes the following parameter:

- `channel` : `String` channel name or a regular expression (`RegExp`)
Not providing a value for `channel` is the same as passing `/.*/` i.e., basically "GET ALL THE CHANNELS AND THEIR SUBSCRIBERS!".

Example:

```javascript
Preach.sub('test1', function(){});
Preach.sub('test2', function(){});
Preach.subscribers(); //Object {test1: Array[1], test2: Array[1]}
Preach.subscribers('test1'); //Object {test1: Array[1]}
```

> ####Note:
> If a RegExp or String is passed as `channel` and there are no channels that match it, then `Preach.subscribers` returns an empty object ie `{}`
and *does not* `throw`.

## Preach.subscriberCount(channel)

This method returns the no of subscribers a channel has.

This method takes the following parameter:

- `channel` : `String` channel name or a regular expression (`RegExp`)
Not providing a value for `channel` is the same as passing `/.*/` i.e., basically "GET THE SUBSCRIBER COUNT FOR ALL THE CHANNELS".

Example:

```javascript
Preach.sub('test1', function(){});
Preach.sub('test1', function(d){ console.log(d); });
Preach.sub('test2', function(){});
Preach.subscriberCount(); //Object {test1: 2, test2: 1}
Preach.subscriberCount('test2'); //Object {test2: 1}
Preach.subscriberCount(/1$/); //Object {test1: 2}
```

> ####Note:
> If a RegExp or String is passed as `channel` and there are no channels that match it, then `Preach.subscriberCount` returns an empty object ie `{}`
and *does not* `throw`.


## Preach.setMaxSubscribers(n)

This sets the max listeners for each channel at `n`. Default is unlimited which is set by making `n` `zero`.

> ####Note:
> If `n` is lesser than `zero` then `Preach` will `throw`.

