/* global require, module, process */
'use strict'


var Kafka  = require('no-kafka'),
  producer = new Kafka.Producer({'connectionString': process.env.DOCKER_IP + ':9092'})


class LogProducer {

/**
 * Constructor for LogProducer Classs
 * @param  {Object} options Configuration object
 * for LogProducer. 'topic' is default is log.
 */
  constructor(options) {
    options = options || {topic: 'log'}
    this.topic = options.topic
  }



/**
 * Send's message once and closes the producer.
 * @param  {Object} data data object
 * with message to send. 'message' is sent
 * to Kafka as a encoded JSON object.
 */

  sendOnce(options) {
    let self = this

    // TODO: Investigate keep producer live
    // instead or reinitializing

    return producer.init().then(function () {

      return producer.send({
        topic: self.topic,
        partition: options.partition || 0,
        message: {
          value: JSON.stringify(options.message) + '\n'
        }
      })

    })
  }

}



module.exports = LogProducer


