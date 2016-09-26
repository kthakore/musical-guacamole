'use strict';

var co = require('co'),
  Kafka = require('no-kafka'),
  consumer = new Kafka.SimpleConsumer(),
  fs = require('fs')

const logFile = 'app.log'

co(function* () {
  // data handler function can return a Promise
  var dataHandler = function (messageSet, topic, partition) {
    messageSet.forEach(function (m) {
      console.log(topic, partition, m.offset, m.message.value.toString('utf8'));
      console.log('Writing to file')
      fs.appendFile(logFile,  m.message.value.toString('utf8'), function (err) {
          console.error(err)
      })
    })
  }
  //
  return consumer.init().then(function () {
    //                     // Subscribe partitons 0 and 1 in a topic:
    return consumer.subscribe('log', [0], dataHandler);
  })
})


