/* global require*/
'use strict'

var co = require('co'),
  Kafka = require('no-kafka'),
  consumer = new Kafka.SimpleConsumer(),
  fs = require('fs')

const logFile = 'app.log'

/*
 * Start a coroutine to run
 * the consumer
 */

co(function* () {
  // data handler function can return a Promise
  var dataHandler = function (messageSet, topic, partition) {

    messageSet.forEach(function (m) {

      fs.appendFile(logFile,  topic + ' ' +
                              partition + ' ' +
                              m.message.value.toString('utf8'),
      function (err) {
        console.error(err)
      })

    })

  }

  yield consumer.init().then(function () {
    return consumer.subscribe('log', [0], dataHandler)
  })
})

