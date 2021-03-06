/* global require, process*/
'use strict'

var co = require('co'),
  Kafka = require('no-kafka'),
  consumer = new Kafka.SimpleConsumer({'connectionString': process.env.DOCKER_IP + ':9092'}),
  fs = require('fs')

const logFile = 'app.log'

/*
 * Start a coroutine to run
 * the consumer
 */

co(function* () {
  // Handles the data whenever there is a message
  // from Kafka consumer defined below
  var dataHandler = function (messageSet, topic, partition) {

    messageSet.forEach(function (m) {
      fs.appendFile(logFile,  topic + ' ' +
                              partition + ' ' +
                              m.message.value.toString('utf8'),
      function (err) {
        if (err !== null) {
          console.error(err)
        }
      })

    })

  }

  // Listen to the log topic on partitions 0 and 1
  yield consumer.init().then(function () {
    return consumer.subscribe('log', [0, 1], dataHandler)
  })
})

