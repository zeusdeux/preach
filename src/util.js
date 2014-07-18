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
